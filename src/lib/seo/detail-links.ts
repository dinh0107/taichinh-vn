/**
 * Map list-item data → its programmatic SEO detail route (or null if none).
 * Source of truth for slugs: src/modules/admin/seo-templates.ts +
 * src/modules/gold/types.ts (SEO_GOLD_SLUGS). Keep in sync when adding pages.
 *
 * Callers link with a hub fallback, e.g. `fxDetailHref(code) ?? "/ty-gia"`.
 */

const GOLD_BRAND_SLUG: Record<string, string> = {
  SJC: "/gia-vang-sjc-hom-nay",
  DOJI: "/gia-vang-doji-hom-nay",
  PNJ: "/gia-vang-pnj-hom-nay",
  BAO_TIN: "/gia-vang-bao-tin-hom-nay",
  WORLD: "/gia-vang-the-gioi-hom-nay",
};

const GOLD_PURITY_SLUG: Record<string, string> = {
  K9999: "/gia-vang-9999-hom-nay",
  K24: "/gia-vang-24k-hom-nay",
  K18: "/gia-vang-18k-hom-nay",
};

export function goldDetailHref(item: {
  brand?: string | null;
  purity?: string | null;
}): string | null {
  if (item.brand && GOLD_BRAND_SLUG[item.brand]) return GOLD_BRAND_SLUG[item.brand];
  if (item.purity && GOLD_PURITY_SLUG[item.purity]) return GOLD_PURITY_SLUG[item.purity];
  return null;
}

const FX_CODES = new Set(["USD", "EUR", "GBP", "JPY", "CNY", "KRW"]);

export function fxDetailHref(code: string): string | null {
  const c = code.trim().toUpperCase();
  return FX_CODES.has(c) ? `/ty-gia-${c.toLowerCase()}-hom-nay` : null;
}

const INTEREST_BANK_SLUGS = new Set([
  "vietcombank",
  "bidv",
  "agribank",
  "mb-bank",
  "acb",
  "techcombank",
  "vpbank",
]);

export function interestDetailHref(bankName: string): string | null {
  const slug = bankName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return INTEREST_BANK_SLUGS.has(slug) ? `/lai-suat-${slug}` : null;
}

const FUEL_SLUG: Record<string, string> = {
  RON95: "/gia-xang-ron95-hom-nay",
  E5: "/gia-xang-e5-hom-nay",
  DIESEL: "/gia-xang-diesel-hom-nay",
};

export function fuelDetailHref(code: string): string | null {
  return FUEL_SLUG[code.trim().toUpperCase()] ?? null;
}

const STOCK_SLUG: Record<string, string> = {
  VNINDEX: "/chung-khoan-vnindex",
  HNXINDEX: "/chung-khoan-hnxindex",
  UPCOM: "/chung-khoan-upcom",
};

export function stockDetailHref(code: string): string | null {
  return STOCK_SLUG[code.trim().toUpperCase()] ?? null;
}
