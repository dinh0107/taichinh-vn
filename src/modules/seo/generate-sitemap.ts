import { revalidatePath } from "next/cache";
import { getPublishedArticleSlugs } from "@/modules/news/service";
import { getIndexedSeoPaths } from "@/modules/admin/seo-service";
import { getSiteBaseUrl } from "@/lib/seo/site-url";
import { logger } from "@/lib/logger";

export type GenerateSitemapResult = {
  urls: number;
  staticPages: number;
  seoPages: number;
  articles: number;
  warmed: boolean;
};

const STATIC_PAGES = [
  "",
  "/gia-vang",
  "/ty-gia",
  "/lai-suat",
  "/chung-khoan",
  "/gia-xang",
  "/tin-tuc",
] as const;

/**
 * Invalidate ISR sitemap cache and optionally warm /sitemap.xml.
 * Next serves sitemap dynamically from src/app/sitemap.ts — no static file to write.
 */
export async function generateSitemap(opts?: {
  warm?: boolean;
}): Promise<GenerateSitemapResult> {
  const seoPaths = await getIndexedSeoPaths();
  const articleSlugs = await getPublishedArticleSlugs();

  const combined = [
    ...STATIC_PAGES,
    ...seoPaths.map((p) => (p.startsWith("/") ? p : `/${p}`)),
    ...articleSlugs.map((slug) => `/tin-tuc/${slug}`),
  ];
  const urls = new Set(combined).size;

  revalidatePath("/sitemap.xml");

  let warmed = false;
  if (opts?.warm !== false) {
    try {
      const base = await getSiteBaseUrl();
      const res = await fetch(`${base.replace(/\/+$/, "")}/sitemap.xml`, {
        cache: "no-store",
        signal: AbortSignal.timeout(60_000),
      });
      warmed = res.ok;
      if (!res.ok) {
        logger.warn({ status: res.status }, "sitemap warm failed");
      }
    } catch (e) {
      logger.warn({ err: e }, "sitemap warm fetch error");
    }
  }

  return {
    urls,
    staticPages: STATIC_PAGES.length,
    seoPages: seoPaths.length,
    articles: articleSlugs.length,
    warmed,
  };
}
