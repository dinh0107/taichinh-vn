import type { MetadataRoute } from "next";
import { SEO_GOLD_SLUGS } from "@/modules/gold/types";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://taichinh.vn";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/gia-vang",
    "/ty-gia",
    "/lai-suat",
    "/chung-khoan",
    "/gia-xang",
    "/tin-tuc",
  ];

  const seoGoldPages = SEO_GOLD_SLUGS.map((s) => `/${s.slug}`);

  const fxSlugs = ["usd", "eur", "gbp", "jpy", "cny", "krw"].map(
    (c) => `/ty-gia-${c}-hom-nay`
  );

  const bankSlugs = [
    "vietcombank",
    "bidv",
    "agribank",
    "mb-bank",
    "acb",
    "techcombank",
    "vpbank",
  ].map((b) => `/lai-suat-${b}`);

  const all = [...staticPages, ...seoGoldPages, ...fxSlugs, ...bankSlugs];

  return all.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path.includes("hom-nay") ? "hourly" as const : "daily" as const,
    priority: path === "" ? 1 : path.includes("gia-vang") ? 0.9 : 0.7,
  }));
}
