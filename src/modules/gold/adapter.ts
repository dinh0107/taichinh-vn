import {
  GOLD_API_CODES,
  GoldHistoryApiSchema,
  GoldPriceApiSchema,
  type GoldApiCode,
  type GoldPriceItem,
} from "./types";
import { logger } from "@/lib/logger";

const BASE_URL = process.env.GOLD_API_BASE_URL ?? "https://giavang.now/api";

export class GoldPriceAdapter {
  private baseUrl: string;

  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async fetchCurrentPrices(): Promise<GoldPriceItem[]> {
    const start = Date.now();
    const res = await fetch(`${this.baseUrl}/prices`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      logger.error({ status: res.status }, "Gold API fetch failed");
      throw new Error(`Gold API error: ${res.status}`);
    }

    const json = await res.json();
    const parsed = GoldPriceApiSchema.parse(json);

    logger.info(
      { latencyMs: Date.now() - start, count: parsed.count },
      "Gold prices fetched"
    );

    return Object.entries(parsed.prices).map(([code, price]) => {
      const meta = GOLD_API_CODES[code as GoldApiCode];
      return {
        code,
        name: price.name,
        nameVi: meta?.nameVi ?? price.name,
        brand: meta?.brand ?? "OTHER",
        purity: meta?.purity ?? "K9999",
        buy: price.buy,
        sell: price.sell,
        changeBuy: price.change_buy,
        changeSell: price.change_sell,
        currency: price.currency,
        slug: meta?.slug ?? code.toLowerCase(),
        recordedAt: new Date((parsed.timestamp ?? Date.now() / 1000) * 1000),
      };
    });
  }

  async fetchHistory(
    code: string,
    days: number
  ): Promise<{ buy: number; sell: number; recordedAt: Date }[]> {
    const cappedDays = Math.min(Math.max(days, 1), 30);
    const res = await fetch(
      `${this.baseUrl}/prices?type=${code}&days=${cappedDays}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error(`Gold history API error: ${res.status}`);
    }

    const json = await res.json();
    const parsed = GoldHistoryApiSchema.safeParse(json);

    if (!parsed.success) {
      // API may return different shape — synthesize from current if needed
      logger.warn({ code }, "History parse failed, returning empty");
      return [];
    }

    return parsed.data.data.map((item) => ({
      buy: item.buy,
      sell: item.sell,
      recordedAt: new Date(item.update_time * 1000),
    }));
  }
}

export const goldAdapter = new GoldPriceAdapter();
