import { z } from "zod";
import { ghnFetchJson } from "@/lib/ghn/client";
import { logger } from "@/lib/logger";
import type { GoldBrandCode, GoldPurity } from "@prisma/client";
import type { GoldPriceItem } from "./types";

const BranchSchema = z.object({
  label: z.string(),
  rows: z.array(
    z.object({
      typeName: z.string(),
      buy: z.number().nullable().optional(),
      sell: z.number().nullable().optional(),
    })
  ),
});

const GoldWidgetSchema = z.object({
  success: z.boolean(),
  data: z.object({
    updatedAt: z.string().optional(),
    source: z.string().optional(),
    unit: z.string().optional(),
    branches: z.array(BranchSchema),
  }),
});

export type GhnGoldBrandSlug =
  | "sjc"
  | "doji"
  | "pnj"
  | "mi-hong"
  | "ngoc-tham"
  | "bao-tin-minh-chau"
  | "phu-quy";

const BRAND_META: Record<
  GhnGoldBrandSlug,
  {
    brand: GoldBrandCode;
    nameVi: string;
    code: string;
    /** Prefer product names matching these (normalized). */
    prefer: RegExp[];
  }
> = {
  sjc: {
    brand: "SJC",
    nameVi: "SJC",
    code: "GHN_SJC",
    prefer: [/sjc.*1\s*l/i, /sjc/i, /mi[eế]ng/i],
  },
  doji: {
    brand: "DOJI",
    nameVi: "DOJI",
    code: "GHN_DOJI",
    prefer: [/sjc/i, /9999/i, /kim\s*tt/i],
  },
  pnj: {
    brand: "PNJ",
    nameVi: "PNJ",
    code: "GHN_PNJ",
    prefer: [/sjc/i, /9999/i, /vàng\s*miếng/i],
  },
  "mi-hong": {
    brand: "OTHER",
    nameVi: "Mi Hồng",
    code: "GHN_MI_HONG",
    prefer: [/^sjc$/i, /sjc/i],
  },
  "ngoc-tham": {
    brand: "OTHER",
    nameVi: "Ngọc Thẩm",
    code: "GHN_NGOC_THAM",
    prefer: [/sjc/i, /miếng/i, /999/i],
  },
  "bao-tin-minh-chau": {
    brand: "BAO_TIN",
    nameVi: "Bảo Tín Minh Châu",
    code: "GHN_BTMC",
    prefer: [/sjc/i, /9999/i],
  },
  "phu-quy": {
    brand: "OTHER",
    nameVi: "Phú Quý",
    code: "GHN_PHU_QUY",
    prefer: [/sjc/i, /9999/i],
  },
};

const HOME_BRANDS: GhnGoldBrandSlug[] = [
  "sjc",
  "doji",
  "mi-hong",
  "ngoc-tham",
  "pnj",
];

function normalizeArea(label: string) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function pickBranch(branches: z.infer<typeof BranchSchema>[]) {
  const scored = branches.map((b) => {
    const n = normalizeArea(b.label);
    let score = 50;
    if (/ho chi minh|hcm|sai gon/.test(n)) score = 0;
    else if (/ha noi|hanoi/.test(n)) score = 1;
    else if (/bien hoa/.test(n)) score = 2;
    return { b, score };
  });
  scored.sort((a, c) => a.score - c.score);
  return scored[0]?.b ?? branches[0];
}

function pickProduct(
  rows: { typeName: string; buy?: number | null; sell?: number | null }[],
  prefer: RegExp[]
) {
  const valid = rows.filter(
    (r) =>
      (r.buy != null && Number.isFinite(r.buy)) ||
      (r.sell != null && Number.isFinite(r.sell))
  );
  for (const re of prefer) {
    const hit = valid.find((r) => re.test(r.typeName));
    if (hit) return hit;
  }
  return valid[0];
}

export async function fetchGhnGoldBrand(
  slug: GhnGoldBrandSlug
): Promise<GoldPriceItem | null> {
  const meta = BRAND_META[slug];
  const json = await ghnFetchJson<unknown>(
    `/api/widgets/gia-vang/${encodeURIComponent(slug)}`
  );
  const parsed = GoldWidgetSchema.parse(json);
  if (!parsed.data.branches.length) return null;

  const branch = pickBranch(parsed.data.branches);
  const product = pickProduct(branch.rows, meta.prefer);
  if (!product) return null;

  const buy = Number(product.buy ?? product.sell ?? 0);
  const sell = Number(product.sell ?? product.buy ?? 0);
  if (!buy && !sell) return null;

  // Keep VND/chi for homepage board (matches giahomnay.vn display: 14.450.000).
  return {
    code: meta.code,
    name: product.typeName,
    nameVi: meta.nameVi,
    brand: meta.brand,
    purity: "K9999" as GoldPurity,
    buy,
    sell,
    changeBuy: 0,
    changeSell: 0,
    currency: "VND",
    slug,
    recordedAt: new Date(parsed.data.updatedAt ?? Date.now()),
  };
}

/** Homepage board: SJC, DOJI, Mi Hồng, Ngọc Thẩm, PNJ (like giahomnay.vn). */
export async function fetchGhnHomeGoldBoard(): Promise<GoldPriceItem[]> {
  const results = await Promise.all(
    HOME_BRANDS.map(async (slug) => {
      try {
        return await fetchGhnGoldBrand(slug);
      } catch (error) {
        logger.warn({ error, slug }, "GHN gold brand fetch failed");
        return null;
      }
    })
  );
  return results.filter((x): x is GoldPriceItem => x !== null);
}
