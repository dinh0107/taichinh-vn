/** Module hub pages that show a bottom SEO article (edited in Admin → SEO). */

export const PAGE_ARTICLE_DEFS = [
  { key: "home", label: "Trang chủ", path: "/", slug: "home" },
  { key: "gia_vang", label: "Giá vàng", path: "/gia-vang", slug: "gia-vang" },
  { key: "ty_gia", label: "Tỷ giá", path: "/ty-gia", slug: "ty-gia" },
  { key: "lai_suat", label: "Lãi suất", path: "/lai-suat", slug: "lai-suat" },
  {
    key: "chung_khoan",
    label: "Chứng khoán",
    path: "/chung-khoan",
    slug: "chung-khoan",
  },
  { key: "gia_xang", label: "Giá xăng", path: "/gia-xang", slug: "gia-xang" },
  { key: "tin_tuc", label: "Tin tức", path: "/tin-tuc", slug: "tin-tuc" },
] as const;

export type PageArticleKey = (typeof PAGE_ARTICLE_DEFS)[number]["key"];

/** Slugs reserved for module hubs — not served by (seo)/[slug] catch-all. */
export const MODULE_HUB_SLUGS = new Set(
  PAGE_ARTICLE_DEFS.map((d) => d.slug)
);

export function pageArticleEnabledKey(key: PageArticleKey): string {
  return `page_article_${key}_enabled`;
}

export function pageArticleContentKey(key: PageArticleKey): string {
  return `page_article_${key}_content`;
}

/** @deprecated Kept for reading legacy settings only. */
export function pageArticleSettingDefaults(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const def of PAGE_ARTICLE_DEFS) {
    out[pageArticleEnabledKey(def.key)] = "false";
    out[pageArticleContentKey(def.key)] = "";
  }
  return out;
}

export function resolvePageArticle(
  settings: Record<string, string>,
  key: PageArticleKey
): { enabled: boolean; content: string } {
  if (key === "home") {
    const legacyOn = settings.home_article_enabled === "true";
    const legacyContent = settings.home_article_content?.trim() || "";
    const enabled =
      settings[pageArticleEnabledKey("home")] === "true" || legacyOn;
    const content =
      settings[pageArticleContentKey("home")]?.trim() || legacyContent;
    return { enabled, content };
  }

  return {
    enabled: settings[pageArticleEnabledKey(key)] === "true",
    content: settings[pageArticleContentKey(key)]?.trim() || "",
  };
}

export function pageArticleDefBySlug(slug: string) {
  return PAGE_ARTICLE_DEFS.find((d) => d.slug === slug);
}
