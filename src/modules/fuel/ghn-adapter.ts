import { z } from "zod";
import { ghnFetchJson } from "@/lib/ghn/client";
import { logger } from "@/lib/logger";
import type { FuelTypeCode } from "@prisma/client";

const FuelWidgetSchema = z.object({
  success: z.boolean(),
  data: z.object({
    updatedAt: z.string().optional(),
    tableRows: z.array(
      z.object({
        rowKey: z.string(),
        label: z.string(),
        values: z
          .object({
            price: z.number().optional(),
            zone1: z.number().optional(),
            zone2: z.number().optional(),
          })
          .passthrough(),
        unit: z.string().optional(),
        delta: z.number().optional(),
        deltaPct: z.number().optional(),
        latestAt: z.string().optional(),
      })
    ),
  }),
});

export type GhnFuelRow = {
  code: string;
  type: string;
  price: number;
  change: number;
  changePct: number;
  zone1?: number;
  zone2?: number;
  unit: string;
  updatedAt: Date;
};

/** Map GHN row keys → our FuelTypeCode for DB persistence. */
export const GHN_TO_FUEL_CODE: Record<string, FuelTypeCode> = {
  "xang-ron-95-iii": "RON95",
  "xang-ron-95-v": "RON95",
  "xang-e10-ron-95-iii": "RON95",
  "xang-e10-ron-95-v": "RON95",
  "xang-e5-ron-92-ii": "E5",
  "dau-do-005s-ii": "DIESEL",
  "dau-do-0001s-v": "DIESEL",
};

export async function fetchGhnPetrolimexPrices(): Promise<GhnFuelRow[]> {
  const json = await ghnFetchJson<unknown>(
    "/api/widgets/xang-dau/petrolimex"
  );
  const parsed = FuelWidgetSchema.parse(json);
  const updatedAt = new Date(
    parsed.data.updatedAt ?? Date.now()
  );

  return parsed.data.tableRows.flatMap((row) => {
    const price =
      row.values.price ?? row.values.zone1 ?? row.values.zone2 ?? null;
    if (price == null || !Number.isFinite(price)) return [];
    const item: GhnFuelRow = {
      code: row.rowKey,
      type: row.label,
      price,
      change: row.delta ?? 0,
      changePct: row.deltaPct ?? 0,
      zone1: row.values.zone1,
      zone2: row.values.zone2,
      unit: row.unit ?? "VND/lit",
      updatedAt: row.latestAt ? new Date(row.latestAt) : updatedAt,
    };
    return [item];
  });
}

export async function fetchGhnPetrolimexPricesSafe(): Promise<GhnFuelRow[]> {
  try {
    return await fetchGhnPetrolimexPrices();
  } catch (error) {
    logger.warn({ error }, "GHN Petrolimex fetch failed");
    return [];
  }
}
