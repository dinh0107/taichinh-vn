import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { getSiteSettingsFresh } from "@/modules/admin/settings-service";
import { getSiteBaseUrl } from "@/lib/seo/site-url";
import {
  fetchPageAnalytics,
  inspectUrl,
  normalizePageUrl,
  type GscCredentials,
} from "@/lib/gsc/client";
import { clearGscTokenCache } from "@/lib/gsc/auth";
import { isGscEnabled } from "@/lib/gsc/feature";
import { withHtmlExtension } from "@/lib/seo/html-path";

export type GscConfigStatus = {
  configured: boolean;
  propertyUrl: string | null;
  clientEmail: string | null;
  missing: string[];
};

export async function getGscConfigStatus(): Promise<GscConfigStatus> {
  if (!isGscEnabled()) {
    return {
      configured: false,
      propertyUrl: null,
      clientEmail: null,
      missing: ["GSC_ENABLED=false (tạm tắt)"],
    };
  }
  // Fresh read — cached getSiteSettings can miss a key vừa Lưu trong Admin.
  const settings = await getSiteSettingsFresh();
  const propertyUrl =
    settings.gsc_property_url?.trim() ||
    process.env.GSC_PROPERTY_URL?.trim() ||
    settings.site_url?.trim() ||
    null;
  const clientEmail =
    settings.gsc_client_email?.trim() ||
    process.env.GSC_CLIENT_EMAIL?.trim() ||
    null;

  let privateKey =
    settings.gsc_private_key?.trim() ||
    process.env.GSC_PRIVATE_KEY?.trim() ||
    null;
  // Secret may be omitted from bulk map in some paths — read row directly.
  if (!privateKey) {
    try {
      const row = await prisma.siteSetting.findUnique({
        where: { key: "gsc_private_key" },
        select: { value: true },
      });
      privateKey = row?.value?.trim() || null;
    } catch {
      privateKey = null;
    }
  }

  const missing: string[] = [];
  if (!propertyUrl) missing.push("GSC Property URL");
  if (!clientEmail) missing.push("Service Account Email");
  if (!privateKey) missing.push("Private Key");

  return {
    configured: missing.length === 0,
    propertyUrl,
    clientEmail,
    missing,
  };
}

export async function resolveGscCredentials(): Promise<GscCredentials | null> {
  const status = await getGscConfigStatus();
  if (!status.configured || !status.propertyUrl || !status.clientEmail) {
    return null;
  }

  const settings = await getSiteSettingsFresh();
  let privateKey =
    settings.gsc_private_key?.trim() || process.env.GSC_PRIVATE_KEY?.trim() || "";
  if (!privateKey) {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "gsc_private_key" },
      select: { value: true },
    });
    privateKey = row?.value?.trim() || "";
  }
  if (!privateKey) return null;

  let propertyUrl = status.propertyUrl;
  if (!propertyUrl.endsWith("/") && propertyUrl.startsWith("http")) {
    propertyUrl = `${propertyUrl}/`;
  }

  return {
    clientEmail: status.clientEmail,
    privateKey,
    propertyUrl,
  };
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** MySQL Prisma String default = VARCHAR(191) until @db.Text is pushed. */
function clipCoverage(value: string | null | undefined, max = 190): string | null {
  if (value == null) return null;
  const s = value.trim();
  if (!s) return null;
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

export async function syncGscToDatabase(): Promise<{
  inspected: number;
  indexed: number;
  errors: number;
  message: string;
}> {
  if (!isGscEnabled()) {
    throw new Error(
      "Google Search Console đang tạm tắt. Đặt GSC_ENABLED=true trong .env khi có key."
    );
  }

  const creds = await resolveGscCredentials();
  if (!creds) {
    const status = await getGscConfigStatus();
    const hint =
      status.missing.length > 0
        ? ` Thiếu: ${status.missing.join(", ")}.`
        : "";
    throw new Error(
      `Chưa cấu hình Google Search Console.${hint} Vào Admin → Cài đặt → GSC.`
    );
  }

  clearGscTokenCache();

  const base = await getSiteBaseUrl();
  const pages = await prisma.seoPage.findMany({
    select: { id: true, slug: true, canonicalUrl: true },
    orderBy: { slug: "asc" },
  });

  if (pages.length === 0) {
    return {
      inspected: 0,
      indexed: 0,
      errors: 0,
      message: "Không có landing page trong DB. Chạy «Đồng bộ template» trước.",
    };
  }

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 28);

  let analytics = new Map<string, { clicks: number; impressions: number; position: number }>();
  try {
    analytics = await fetchPageAnalytics(
      creds,
      formatDate(start),
      formatDate(end),
      2500
    );
  } catch (e) {
    logger.warn({ e }, "GSC analytics fetch failed — continuing with inspection only");
  }

  let inspected = 0;
  let indexed = 0;
  let errors = 0;
  const syncedAt = new Date();

  for (const page of pages) {
    const pageUrl =
      page.canonicalUrl ??
      `${base.replace(/\/$/, "")}${withHtmlExtension(`/${page.slug}`)}`;
    const pathKey = normalizePageUrl(pageUrl);
    const stats = analytics.get(pathKey);

    try {
      const result = await inspectUrl(creds, pageUrl);
      inspected++;
      if (result.status === "INDEXED") indexed++;
      if (result.status === "ERROR") errors++;

      await prisma.seoPage.update({
        where: { id: page.id },
        data: {
          gscIndexStatus: result.status,
          gscCoverageState: clipCoverage(result.coverageState),
          gscLastCrawlAt: result.lastCrawlAt,
          gscClicks: stats?.clicks ?? 0,
          gscImpressions: stats?.impressions ?? 0,
          gscPosition: stats?.position ?? null,
          gscSyncedAt: syncedAt,
        },
      });
    } catch (e) {
      errors++;
      logger.error({ e, slug: page.slug }, "GSC inspect failed");
      await prisma.seoPage.update({
        where: { id: page.id },
        data: {
          gscIndexStatus: "ERROR",
          gscCoverageState: clipCoverage((e as Error).message),
          gscSyncedAt: syncedAt,
        },
      });
    }

    await sleep(350);
  }

  return {
    inspected,
    indexed,
    errors,
    message: `GSC: đã kiểm tra ${inspected} URL — ${indexed} indexed, ${errors} lỗi.`,
  };
}
