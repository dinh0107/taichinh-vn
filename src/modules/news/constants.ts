import type { NewsCategoryCode } from "@prisma/client";

export const NEWS_CATEGORY_COLORS: Record<NewsCategoryCode, string> = {
  GOLD: "border-amber-200 bg-amber-50 text-amber-800",
  STOCKS: "border-violet-200 bg-violet-50 text-violet-800",
  BANKING: "border-sky-200 bg-sky-50 text-sky-800",
  REAL_ESTATE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ECONOMY: "border-finance-200 bg-finance-100 text-finance-700",
  GENERAL: "border-finance-200 bg-finance-50 text-finance-600",
};

export const NEWS_CATEGORY_COLORS_DARK: Record<NewsCategoryCode, string> = {
  GOLD: "bg-amber-100/20 text-amber-300",
  STOCKS: "bg-violet-500/20 text-violet-200",
  BANKING: "bg-sky-500/20 text-sky-200",
  REAL_ESTATE: "bg-emerald-500/20 text-emerald-200",
  ECONOMY: "bg-white/10 text-stone-200",
  GENERAL: "bg-white/10 text-white",
};
