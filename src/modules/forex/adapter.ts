import { z } from "zod";
import type { CurrencyCode } from "@prisma/client";
import { logger } from "@/lib/logger";

const BASE_URL =
  process.env.FOREX_API_BASE_URL ?? "https://www.vietcombank.com.vn/api";

const SUPPORTED: CurrencyCode[] = ["USD", "EUR", "GBP", "JPY", "CNY", "KRW"];

const VcbItemSchema = z.object({
  currencyName: z.string(),
  currencyCode: z.string(),
  cash: z.string().optional().default(""),
  transfer: z.string().optional().default(""),
  sell: z.string().optional().default(""),
});

const VcbResponseSchema = z.object({
  Date: z.string().optional(),
  UpdatedDate: z.string().optional(),
  Data: z.array(VcbItemSchema),
});

export type ForexRateItem = {
  currency: CurrencyCode;
  buyRate: number;
  transferRate: number | null;
  sellRate: number;
  recordedAt: Date;
};

function toNumber(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Vietcombank public exchange-rate API.
 * Returns Vietcombank's own buy (cash/transfer) and sell rates in VND.
 */
export class ForexAdapter {
  constructor(private baseUrl = BASE_URL) {}

  async fetchCurrentRates(): Promise<ForexRateItem[]> {
    const start = Date.now();
    const date = new Date().toISOString().slice(0, 10);
    const res = await fetch(`${this.baseUrl}/exchangerates?date=${date}`, {
      next: { revalidate: 1800 },
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      logger.error({ status: res.status }, "Forex API fetch failed");
      throw new Error(`Forex API error: ${res.status}`);
    }

    const json = await res.json();
    const parsed = VcbResponseSchema.parse(json);
    const recordedAt = parsed.UpdatedDate ? new Date(parsed.UpdatedDate) : new Date();

    const supported = new Set<string>(SUPPORTED);
    const items: ForexRateItem[] = [];

    for (const row of parsed.Data) {
      if (!supported.has(row.currencyCode)) continue;
      const transfer = toNumber(row.transfer);
      const cash = toNumber(row.cash);
      const sell = toNumber(row.sell);
      const buy = cash ?? transfer;
      if (!buy || !sell) continue;
      items.push({
        currency: row.currencyCode as CurrencyCode,
        buyRate: buy,
        transferRate: transfer ?? null,
        sellRate: sell,
        recordedAt,
      });
    }

    logger.info(
      { latencyMs: Date.now() - start, count: items.length },
      "Forex rates fetched"
    );
    return items;
  }
}

export const forexAdapter = new ForexAdapter();
