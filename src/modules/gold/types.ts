import { z } from "zod";
import { GoldBrandCode, GoldPurity } from "@prisma/client";

export const GOLD_API_CODES = {
  XAUUSD: { brand: "WORLD" as GoldBrandCode, purity: "WORLD_OZ" as GoldPurity, nameVi: "Vàng thế giới", slug: "vang-the-gioi" },
  SJL1L10: { brand: "SJC" as GoldBrandCode, purity: "K9999" as GoldPurity, nameVi: "Vàng SJC 9999", slug: "sjc-9999" },
  SJ9999: { brand: "SJC" as GoldBrandCode, purity: "RING" as GoldPurity, nameVi: "Vàng SJC nhẫn", slug: "sjc-nhan" },
  DOHNL: { brand: "DOJI" as GoldBrandCode, purity: "K9999" as GoldPurity, nameVi: "Vàng DOJI Hà Nội", slug: "doji-ha-noi" },
  DOHCML: { brand: "DOJI" as GoldBrandCode, purity: "K9999" as GoldPurity, nameVi: "Vàng DOJI HCM", slug: "doji-hcm" },
  DOJINHTV: { brand: "DOJI" as GoldBrandCode, purity: "K24" as GoldPurity, nameVi: "Vàng DOJI trang sức", slug: "doji-trang-suc" },
  PQHNVM: { brand: "PNJ" as GoldBrandCode, purity: "K9999" as GoldPurity, nameVi: "Vàng PNJ Hà Nội", slug: "pnj-ha-noi" },
  PQHN24NTT: { brand: "PNJ" as GoldBrandCode, purity: "K24" as GoldPurity, nameVi: "Vàng PNJ 24K", slug: "pnj-24k" },
  BTSJC: { brand: "BAO_TIN" as GoldBrandCode, purity: "K9999" as GoldPurity, nameVi: "Vàng Bảo Tín SJC", slug: "bao-tin-sjc" },
  BT9999NTT: { brand: "BAO_TIN" as GoldBrandCode, purity: "K9999" as GoldPurity, nameVi: "Vàng Bảo Tín 9999", slug: "bao-tin-9999" },
  VNGSJC: { brand: "SJC" as GoldBrandCode, purity: "K9999" as GoldPurity, nameVi: "Vàng SJC VN", slug: "vn-gold-sjc" },
  VIETTINMSJC: { brand: "VIETTIN" as GoldBrandCode, purity: "K9999" as GoldPurity, nameVi: "Vàng Viettin SJC", slug: "viettin-sjc" },
} as const;

export type GoldApiCode = keyof typeof GOLD_API_CODES;

export const GoldPriceApiSchema = z.object({
  success: z.boolean(),
  timestamp: z.number().optional(),
  time: z.string().optional(),
  date: z.string().optional(),
  count: z.number().optional(),
  prices: z.record(
    z.string(),
    z.object({
      name: z.string(),
      buy: z.number(),
      sell: z.number(),
      change_buy: z.number(),
      change_sell: z.number(),
      currency: z.string(),
    })
  ),
});

export const GoldHistoryApiSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      buy: z.number(),
      sell: z.number(),
      update_time: z.number(),
    })
  ),
});

export type GoldPriceItem = {
  code: string;
  name: string;
  nameVi: string;
  brand: GoldBrandCode;
  purity: GoldPurity;
  buy: number;
  sell: number;
  changeBuy: number;
  changeSell: number;
  currency: string;
  slug: string;
  recordedAt: Date;
};

export type HistoryRange = "1d" | "7d" | "30d" | "90d" | "1y" | "all";

export const HISTORY_RANGE_DAYS: Record<HistoryRange, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
  all: 3650,
};

export const SEO_GOLD_SLUGS = [
  { slug: "gia-vang-hom-nay", title: "Giá vàng hôm nay", codes: Object.keys(GOLD_API_CODES) },
  { slug: "gia-vang-sjc-hom-nay", title: "Giá vàng SJC hôm nay", brand: "SJC" },
  { slug: "gia-vang-doji-hom-nay", title: "Giá vàng DOJI hôm nay", brand: "DOJI" },
  { slug: "gia-vang-pnj-hom-nay", title: "Giá vàng PNJ hôm nay", brand: "PNJ" },
  { slug: "gia-vang-bao-tin-hom-nay", title: "Giá vàng Bảo Tín hôm nay", brand: "BAO_TIN" },
  { slug: "gia-vang-9999-hom-nay", title: "Giá vàng 9999 hôm nay", purity: "K9999" },
  { slug: "gia-vang-24k-hom-nay", title: "Giá vàng 24K hôm nay", purity: "K24" },
  { slug: "gia-vang-18k-hom-nay", title: "Giá vàng 18K hôm nay", purity: "K18" },
  { slug: "gia-vang-the-gioi-hom-nay", title: "Giá vàng thế giới hôm nay", brand: "WORLD" },
] as const;
