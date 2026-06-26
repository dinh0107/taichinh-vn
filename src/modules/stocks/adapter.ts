import { z } from "zod";
import { logger } from "@/lib/logger";

const BASE_URL =
  process.env.STOCKS_API_BASE_URL ?? "https://finfo-api.vndirect.com.vn/v4";

// Our index code -> VNDIRECT code
const VND_CODE: Record<string, string> = {
  VNINDEX: "VNINDEX",
  HNXINDEX: "HNXINDEX",
  UPCOM: "HNXUpcomIndex",
};

const VndPriceSchema = z.object({
  data: z.array(
    z.object({
      code: z.string(),
      date: z.string(),
      close: z.number(),
      open: z.number().optional(),
      high: z.number().optional(),
      low: z.number().optional(),
      nmVolume: z.number().optional(),
      nmValue: z.number().optional(),
    })
  ),
});

export type IndexQuote = {
  code: string;
  value: number;
  open: number | null;
  volume: number | null;
  valueTraded: number | null;
  recordedAt: Date;
};

/**
 * VNDIRECT public price API for market indices.
 * Note: some hosting/network environments block this host; callers should
 * handle failures gracefully (see syncStocksToDb fallback).
 */
export class StocksAdapter {
  constructor(private baseUrl = BASE_URL) {}

  async fetchIndex(code: string): Promise<IndexQuote | null> {
    const vndCode = VND_CODE[code] ?? code;
    const res = await fetch(
      `${this.baseUrl}/stock_prices?sort=date:desc&q=code:${vndCode}&size=1`,
      {
        next: { revalidate: 600 },
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }
    );
    if (!res.ok) throw new Error(`Stocks API error: ${res.status}`);

    const parsed = VndPriceSchema.parse(await res.json());
    const row = parsed.data[0];
    if (!row) return null;

    return {
      code,
      value: row.close,
      open: row.open ?? null,
      volume: row.nmVolume ?? null,
      valueTraded: row.nmValue ?? null,
      recordedAt: row.date ? new Date(row.date) : new Date(),
    };
  }

  async fetchIndices(codes: string[]): Promise<IndexQuote[]> {
    const start = Date.now();
    const out: IndexQuote[] = [];
    for (const code of codes) {
      const q = await this.fetchIndex(code);
      if (q) out.push(q);
    }
    logger.info(
      { latencyMs: Date.now() - start, count: out.length },
      "Stock indices fetched"
    );
    return out;
  }
}

export const stocksAdapter = new StocksAdapter();
