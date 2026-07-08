import type {
  NewsCategoryCode,
  ArticleStatus,
  AdType,
  AdPosition,
  SeoPageType,
  GscIndexStatus,
  CronJobStatus,
  UserRole,
} from "@prisma/client";

export const ADMIN_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  EDITOR: "Biên tập viên",
  USER: "Người dùng",
};

export const NEWS_CATEGORY_LABELS: Record<NewsCategoryCode, string> = {
  GOLD: "Giá vàng",
  STOCKS: "Chứng khoán",
  BANKING: "Ngân hàng",
  REAL_ESTATE: "Bất động sản",
  ECONOMY: "Kinh tế",
  GENERAL: "Tổng hợp",
};

export const ARTICLE_STATUS_LABELS: Record<
  ArticleStatus | "SCHEDULED",
  { label: string; tone: "emerald" | "slate" | "sky" | "red" }
> = {
  PUBLISHED: { label: "Đã đăng", tone: "emerald" },
  DRAFT: { label: "Nháp", tone: "slate" },
  ARCHIVED: { label: "Lưu trữ", tone: "red" },
  SCHEDULED: { label: "Lên lịch", tone: "sky" },
};

export const AD_TYPE_LABELS: Record<AdType, string> = {
  ADSENSE: "AdSense",
  BANNER: "Banner",
  AFFILIATE_BANK: "Affiliate NH",
  AFFILIATE_STOCK: "Affiliate CK",
  AFFILIATE_GOLD: "Affiliate Vàng",
  NATIVE: "Native",
};

export const AD_POSITION_LABELS: Record<AdPosition, string> = {
  HEADER: "Header",
  SIDEBAR: "Sidebar",
  IN_CONTENT: "In-content",
  FOOTER: "Footer",
  STICKY: "Sticky",
};

export const SEO_PAGE_TYPE_LABELS: Record<SeoPageType, string> = {
  GOLD_TODAY: "Giá vàng",
  GOLD_BRAND: "Giá vàng",
  GOLD_PURITY: "Giá vàng",
  FX_CURRENCY: "Tỷ giá",
  INTEREST_BANK: "Lãi suất",
  STOCK_INDEX: "Chứng khoán",
  FUEL_TYPE: "Giá xăng",
  CUSTOM: "Khác",
};

export const GSC_INDEX_STATUS_LABELS: Record<
  GscIndexStatus,
  { label: string; tone: "emerald" | "amber" | "red" | "slate" | "sky" | "violet" }
> = {
  UNKNOWN: { label: "Chưa kiểm tra", tone: "slate" },
  INDEXED: { label: "Đã index (GSC)", tone: "emerald" },
  NOT_INDEXED: { label: "Chưa index", tone: "red" },
  CRAWLED_NOT_INDEXED: { label: "Đã crawl, chưa index", tone: "amber" },
  DUPLICATE: { label: "Trùng lặp", tone: "violet" },
  BLOCKED: { label: "Bị chặn", tone: "red" },
  ERROR: { label: "Lỗi API", tone: "red" },
};

export function cronStatusToUi(
  status: CronJobStatus
): "success" | "failed" | "running" {
  if (status === "SUCCESS") return "success";
  if (status === "FAILED") return "failed";
  return "running";
}
