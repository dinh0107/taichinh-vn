import { getSiteSettings } from "@/modules/admin/settings-service";
import { SETTING_DEFAULTS } from "@/modules/admin/settings-shared";

const PRODUCTION_FALLBACK = "https://taichinh.vn";

export async function getSiteBaseUrl(): Promise<string> {
  try {
    const s = await getSiteSettings();
    return (
      s.site_url?.replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      PRODUCTION_FALLBACK
    );
  } catch {
    return (
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      PRODUCTION_FALLBACK
    );
  }
}

export async function canonicalUrl(path: string): Promise<string> {
  const base = await getSiteBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function siteBaseUrlSync(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || PRODUCTION_FALLBACK
  );
}

export function canonicalUrlSync(path: string): string {
  const base = siteBaseUrlSync();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
