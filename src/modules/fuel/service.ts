import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import type { FuelTypeCode } from "@prisma/client";
import { isNextProductionBuild } from "@/lib/build-phase";
import {
  fetchGhnPetrolimexPricesSafe,
  GHN_TO_FUEL_CODE,
  type GhnFuelRow,
} from "./ghn-adapter";

const SOURCE = "giahomnay.vn";
const REGION = "national";

const FUEL_LABEL: Record<FuelTypeCode, string> = {
  RON95: "Xăng RON95-III",
  E5: "Xăng E5 RON92",
  DIESEL: "Dầu Diesel 0.05S",
};

export type FuelRow = {
  code: string;
  type: string;
  price: number;
  change: number;
  changePct?: number;
  zone1?: number;
  zone2?: number;
  unit?: string;
  updatedAt?: Date;
};

export type FuelHistoryRow = { date: string; price: number; change: number };

function ghnToFuelRow(row: GhnFuelRow): FuelRow {
  return {
    code: row.code,
    type: row.type,
    price: row.price,
    change: row.change,
    changePct: row.changePct,
    zone1: row.zone1 ?? row.price,
    zone2: row.zone2 ?? row.price,
    unit: row.unit,
    updatedAt: row.updatedAt,
  };
}

/** Latest prices — prefer live GHN Petrolimex widget, fallback DB. */
export async function getFuelPrices(): Promise<FuelRow[]> {
  if (isNextProductionBuild()) return [];

  const live = await fetchGhnPetrolimexPricesSafe();
  if (live.length > 0) return live.map(ghnToFuelRow);

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
        zone1: Number(latest.price),
        zone2: Number(latest.price),
        updatedAt: latest.recordedAt,
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
  if (isNextProductionBuild()) return [];
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

/**
 * Sync fuel from GiaHomNay Petrolimex widget API into DB (mapped to RON95/E5/DIESEL).
 */
export async function syncFuelToDb(): Promise<number> {
  const rows = await fetchGhnPetrolimexPricesSafe();
  if (rows.length === 0) {
    logger.warn("Fuel sync skipped — GHN returned no rows");
    return 0;
  }

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  let synced = 0;

  const byCode = new Map<FuelTypeCode, GhnFuelRow>();
  // Preference order within each mapped FuelTypeCode
  const preferScore = (code: string) => {
    if (code === "xang-ron-95-iii") return 100;
    if (code === "xang-e5-ron-92-ii") return 100;
    if (code === "dau-do-005s-ii") return 100;
    if (code.includes("iii")) return 80;
    if (code.includes("005")) return 80;
    return 10;
  };

  for (const row of rows) {
    const mapped = GHN_TO_FUEL_CODE[row.code];
    if (!mapped) continue;
    const existing = byCode.get(mapped);
    if (!existing || preferScore(row.code) > preferScore(existing.code)) {
      byCode.set(mapped, row);
    }
  }

  for (const [fuelType, row] of byCode) {
    const price = row.price;
    const change = row.change;

    await prisma.fuelPrice.create({
      data: {
        fuelType,
        price,
        change,
        region: REGION,
        source: SOURCE,
        recordedAt: now,
      },
    });

    await prisma.fuelPriceHistory.upsert({
      where: {
        fuelType_region_recordedAt: {
          fuelType,
          region: REGION,
          recordedAt: today,
        },
      },
      create: { fuelType, price, region: REGION, recordedAt: today },
      update: { price },
    });

    synced++;
  }

  logger.info({ synced, source: SOURCE }, "Fuel prices synced to DB");
  return synced;
}
