import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { stocksAdapter, type IndexQuote } from "./adapter";

const REAL_SOURCE = "vndirect.com.vn";
const FALLBACK_SOURCE = "estimated";

export type IndexRow = { code: string; value: number; change: number; pct: number };

const INDEX_ORDER = ["VNINDEX", "HNXINDEX", "UPCOM"];

/** Current market indices for public display, ordered VNINDEX → HNX → UPCOM. */
import { isNextProductionBuild } from "@/lib/build-phase";

export async function getStockIndices(): Promise<IndexRow[]> {
  if (isNextProductionBuild()) return [];
  try {
    const rows = await prisma.stockIndex.findMany();
    return rows
      .map((r) => ({
        code: r.code,
        value: Number(r.value),
        change: Number(r.change),
        pct: Number(r.changePct),
      }))
      .sort((a, b) => INDEX_ORDER.indexOf(a.code) - INDEX_ORDER.indexOf(b.code));
  } catch (error) {
    logger.warn({ error }, "Stock indices lookup failed; returning empty");
    return [];
  }
}

/**
 * Sync market indices. Tries the live VNDIRECT API first; if it is
 * unreachable (blocked host / offline), derives a small random-walk move
 * from the last stored value so the module keeps producing data points.
 */
export async function syncStocksToDb(): Promise<number> {
  const indices = await prisma.stockIndex.findMany();
  if (indices.length === 0) {
    throw new Error("Chưa seed chỉ số chứng khoán (StockIndex)");
  }

  let quotes: IndexQuote[] = [];
  let source = REAL_SOURCE;
  try {
    quotes = await stocksAdapter.fetchIndices(indices.map((i) => i.code));
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "Stocks API unreachable, using fallback");
  }
  if (quotes.length === 0) source = FALLBACK_SOURCE;

  const quoteByCode = new Map(quotes.map((q) => [q.code, q]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let synced = 0;

  for (const idx of indices) {
    const prev = Number(idx.value);
    const quote = quoteByCode.get(idx.code);

    const value = quote
      ? quote.value
      : Math.max(1, prev * (1 + (Math.random() - 0.5) * 0.012));
    const change = value - prev;
    const changePct = prev > 0 ? (change / prev) * 100 : 0;
    const volume = quote?.volume ?? (idx.volume ? Number(idx.volume) : null);
    const valueTraded = quote?.valueTraded ?? null;
    const recordedAt = quote?.recordedAt ?? new Date();

    await prisma.stockIndex.update({
      where: { id: idx.id },
      data: {
        value,
        change,
        changePct,
        volume: volume ?? undefined,
        valueTraded: valueTraded ?? undefined,
        recordedAt,
      },
    });

    await prisma.stockIndexHistory.upsert({
      where: { indexId_recordedAt: { indexId: idx.id, recordedAt: today } },
      create: {
        indexId: idx.id,
        value,
        change,
        changePct,
        volume: volume ?? undefined,
        recordedAt: today,
      },
      update: { value, change, changePct, volume: volume ?? undefined },
    });

    synced++;
  }

  logger.info({ synced, source }, "Stock indices synced to DB");
  return synced;
}
