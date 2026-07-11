import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import type { FuelTypeCode } from "@prisma/client";

const SOURCE = "curated";
const REGION = "national";

const FUEL_LABEL: Record<FuelTypeCode, string> = {
  RON95: "Xăng RON95-III",
  E5: "Xăng E5 RON92",
  DIESEL: "Dầu Diesel 0.05S",
};

export type FuelRow = {
  code: FuelTypeCode;
  type: string;
  price: number;
  change: number;
};

export type FuelHistoryRow = { date: string; price: number; change: number };

/** Latest price per fuel type for public display. */
export async function getFuelPrices(): Promise<FuelRow[]> {
  try {
    const out: FuelRow[] = [];
    for (const code of Object.keys(FUEL_LABEL) as FuelTypeCode[]) {
      const latest = await prisma.fuelPrice.findFirst({
        where: { fuelType: code, region: REGION },
        orderBy: { recordedAt: "desc" },
      });
      if (!latest) continue;
      out.push({
        code,
        type: FUEL_LABEL[code],
        price: Number(latest.price),
        change: Number(latest.change),
      });
    }
    return out;
  } catch (error) {
    logger.warn({ error }, "Fuel prices lookup failed; returning empty");
    return [];
  }
}

/** Adjustment history for one fuel type (newest first), change computed vs prev. */
export async function getFuelHistory(
  code: FuelTypeCode,
  take = 6
): Promise<FuelHistoryRow[]> {
  try {
    const rows = await prisma.fuelPriceHistory.findMany({
      where: { fuelType: code, region: REGION },
      orderBy: { recordedAt: "desc" },
      take: take + 1,
    });
    if (rows.length === 0) return [];

    const result: FuelHistoryRow[] = [];
    for (let i = 0; i < Math.min(rows.length, take); i++) {
      const cur = rows[i];
      const prev = rows[i + 1];
      const change = prev ? Number(cur.price) - Number(prev.price) : 0;
      result.push({
        date: cur.recordedAt.toLocaleDateString("vi-VN"),
        price: Number(cur.price),
        change,
      });
    }
    return result;
  } catch (error) {
    logger.warn({ error, code }, "Fuel history lookup failed; returning empty");
    return [];
  }
}

// Baseline retail prices (VND/litre) — representative VN levels.
const BASE_PRICE: Record<FuelTypeCode, number> = {
  RON95: 20500,
  E5: 19500,
  DIESEL: 18500,
};

/**
 * Persist national retail fuel prices. Vietnam adjusts prices on a fixed
 * cadence (every ~10 days) and there is no free public JSON API, so this
 * uses a curated baseline. Replace the price source to wire a real feed.
 */
export async function syncFuelToDb(): Promise<number> {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  let synced = 0;

  for (const fuelType of Object.keys(BASE_PRICE) as FuelTypeCode[]) {
    const last = await prisma.fuelPrice.findFirst({
      where: { fuelType, region: REGION },
      orderBy: { recordedAt: "desc" },
    });

    const price = last ? Number(last.price) : BASE_PRICE[fuelType];
    const change = last ? price - Number(last.price) : 0;

    await prisma.fuelPrice.create({
      data: { fuelType, price, change, region: REGION, source: SOURCE, recordedAt: now },
    });

    await prisma.fuelPriceHistory.upsert({
      where: {
        fuelType_region_recordedAt: { fuelType, region: REGION, recordedAt: today },
      },
      create: { fuelType, price, region: REGION, recordedAt: today },
      update: { price },
    });

    synced++;
  }

  logger.info({ synced }, "Fuel prices synced to DB");
  return synced;
}
