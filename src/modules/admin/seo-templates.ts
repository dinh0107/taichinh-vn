import type { SeoPageType } from "@prisma/client";
import { SEO_GOLD_SLUGS } from "@/modules/gold/types";
import { PAGE_ARTICLE_DEFS } from "./page-articles";

export type SeoPageConfig = {
  brand?: string;
  purity?: string;
  currency?: string;
  bankSlug?: string;
  bankName?: string;
  fuelCode?: string;
  indexCode?: string;
};

export type SeoTemplate = {
  slug: string;
  pageType: SeoPageType;
  title: string;
  metaDescription: string;
  h1: string;
  config?: SeoPageConfig;
  /** Module hub: content edited in SEO admin, served by dedicated app route. */
  hubOnly?: boolean;
};

const FX_CURRENCIES = [
  { code: "usd", label: "USD", name: "Đô la Mỹ" },
  { code: "eur", label: "EUR", name: "Euro" },
  { code: "gbp", label: "GBP", name: "Bảng Anh" },
  { code: "jpy", label: "JPY", name: "Yên Nhật" },
  { code: "cny", label: "CNY", name: "Nhân dân tệ" },
  { code: "krw", label: "KRW", name: "Won Hàn" },
] as const;

const INTEREST_BANKS = [
  { slug: "vietcombank", name: "Vietcombank" },
  { slug: "bidv", name: "BIDV" },
  { slug: "agribank", name: "Agribank" },
  { slug: "mb-bank", name: "MB Bank" },
  { slug: "acb", name: "ACB" },
  { slug: "techcombank", name: "Techcombank" },
  { slug: "vpbank", name: "VPBank" },
] as const;

const FUEL_TYPES = [
  { code: "RON95", slug: "ron95", label: "Xăng RON95-III" },
  { code: "E5", slug: "e5", label: "Xăng E5 RON92" },
  { code: "DIESEL", slug: "diesel", label: "Dầu Diesel 0.05S" },
] as const;

const STOCK_INDICES = [
  { code: "VNINDEX", slug: "vnindex", label: "VN-Index" },
  { code: "HNXINDEX", slug: "hnxindex", label: "HNX-Index" },
  { code: "UPCOM", slug: "upcom", label: "UPCOM Index" },
] as const;

function goldTemplates(): SeoTemplate[] {
  return SEO_GOLD_SLUGS.map((g) => {
    const config: SeoPageConfig = {};
    if ("brand" in g) config.brand = g.brand;
    if ("purity" in g) config.purity = g.purity;

    let pageType: SeoPageType = "GOLD_TODAY";
    if ("brand" in g) pageType = "GOLD_BRAND";
    else if ("purity" in g) pageType = "GOLD_PURITY";

    const lower = g.title.toLowerCase();
    return {
      slug: g.slug,
      pageType,
      title: g.title,
      h1: g.title,
      metaDescription: `Cập nhật ${lower} mới nhất. So sánh giá mua/bán, biểu đồ và FAQ — TaiChinh.vn.`,
      config,
    };
  });
}

function fxTemplates(): SeoTemplate[] {
  return FX_CURRENCIES.map((c) => ({
    slug: `ty-gia-${c.code}-hom-nay`,
    pageType: "FX_CURRENCY" as const,
    title: `Tỷ giá ${c.label} hôm nay`,
    h1: `Tỷ giá ${c.label} hôm nay`,
    metaDescription: `Tỷ giá ${c.name} (${c.label}/VND) mua/bán tại các ngân hàng lớn. Cập nhật liên tục trên TaiChinh.vn.`,
    config: { currency: c.label },
  }));
}

function interestTemplates(): SeoTemplate[] {
  return INTEREST_BANKS.map((b) => ({
    slug: `lai-suat-${b.slug}`,
    pageType: "INTEREST_BANK" as const,
    title: `Lãi suất ${b.name}`,
    h1: `Lãi suất tiết kiệm ${b.name}`,
    metaDescription: `So sánh lãi suất tiết kiệm ${b.name} các kỳ hạn. Tính lãi tiền gửi nhanh — TaiChinh.vn.`,
    config: { bankSlug: b.slug, bankName: b.name },
  }));
}

function fuelTemplates(): SeoTemplate[] {
  return FUEL_TYPES.map((f) => ({
    slug: `gia-xang-${f.slug}-hom-nay`,
    pageType: "FUEL_TYPE" as const,
    title: `Giá ${f.label.toLowerCase()} hôm nay`,
    h1: `Giá ${f.label.toLowerCase()} hôm nay`,
    metaDescription: `Giá bán lẻ ${f.label} mới nhất sau kỳ điều hành. Lịch sử biến động trên TaiChinh.vn.`,
    config: { fuelCode: f.code },
  }));
}

function stockTemplates(): SeoTemplate[] {
  return STOCK_INDICES.map((i) => ({
    slug: `chung-khoan-${i.slug}`,
    pageType: "STOCK_INDEX" as const,
    title: `${i.label} hôm nay`,
    h1: `Chỉ số ${i.label} hôm nay`,
    metaDescription: `Cập nhật ${i.label} — điểm số, biến động phiên giao dịch mới nhất trên TaiChinh.vn.`,
    config: { indexCode: i.code },
  }));
}

/** Main module pages — appear in Admin → SEO for writing bottom articles. */
function moduleHubTemplates(): SeoTemplate[] {
  return PAGE_ARTICLE_DEFS.map((d) => ({
    slug: d.slug,
    pageType: "CUSTOM" as const,
    title: d.label,
    h1: d.label,
    metaDescription: `Nội dung SEO trang ${d.label} (${d.path}) trên TaiChinh.vn.`,
    hubOnly: true,
  }));
}

export const SEO_TEMPLATES: SeoTemplate[] = [
  ...moduleHubTemplates(),
  ...goldTemplates(),
  ...fxTemplates(),
  ...interestTemplates(),
  ...fuelTemplates(),
  ...stockTemplates(),
];

/** Public programmatic SEO landings (excludes module hubs). */
export const SEO_LANDING_TEMPLATES: SeoTemplate[] = SEO_TEMPLATES.filter(
  (t) => !t.hubOnly
);

export function getSeoTemplate(slug: string): SeoTemplate | undefined {
  return SEO_TEMPLATES.find((t) => t.slug === slug);
}

export function isModuleHubSlug(slug: string): boolean {
  return SEO_TEMPLATES.some((t) => t.slug === slug && t.hubOnly);
}

export function parseSeoConfig(raw: unknown): SeoPageConfig {
  if (!raw || typeof raw !== "object") return {};
  return raw as SeoPageConfig;
}
