import { getSiteSettings } from "@/modules/admin/settings-service";
import { isNextProductionBuild } from "@/lib/build-phase";
import { withHtmlExtension } from "@/lib/seo/html-path";

const PRODUCTION_FALLBACK = "https://giahomnay.site";

export async function getSiteBaseUrl(): Promise<string> {
  if (isNextProductionBuild()) {
    return siteBaseUrlSync();
  }

  try {
    const s = await getSiteSettings();
    return (
      s.site_url?.replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      PRODUCTION_FALLBACK
    );
  } catch {
    return siteBaseUrlSync();
  }
}

function toPublicPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return withHtmlExtension(normalized);
}

export async function canonicalUrl(path: string): Promise<string> {
  const base = await getSiteBaseUrl();
  const publicPath = toPublicPath(path);
  if (publicPath === "/") return `${base}/`;
  return `${base}${publicPath}`;
}

export function siteBaseUrlSync(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || PRODUCTION_FALLBACK
  );
}

export function canonicalUrlSync(path: string): string {
  const base = siteBaseUrlSync();
  const publicPath = toPublicPath(path);
  if (publicPath === "/") return `${base}/`;
  return `${base}${publicPath}`;
}
