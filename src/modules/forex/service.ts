import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { forexAdapter } from "./adapter";

const SOURCE = "vietcombank.com.vn";

export type ForexBankRates = {
  bankName: string;
  rates: Record<string, { buy: number; sell: number; ch: number }>;
};

/**
 * Latest exchange rate per currency, grouped by bank, for public display.
 * Returns only banks that actually have rate data (empty => caller falls back).
 */
export async function getForexRatesByBank(): Promise<ForexBankRates[]> {
  try {
    const banks = await prisma.bank.findMany({ orderBy: { code: "asc" } });
    const out: ForexBankRates[] = [];

    for (const bank of banks) {
      const rows = await prisma.exchangeRate.findMany({
        where: { bankId: bank.id },
        orderBy: { recordedAt: "desc" },
        take: 60,
      });
      if (rows.length === 0) continue;

      const rates: ForexBankRates["rates"] = {};
      for (const r of rows) {
        if (rates[r.currency]) continue; // keep the most recent per currency
        rates[r.currency] = {
          buy: Number(r.buyRate),
          sell: Number(r.sellRate),
          ch: Number(r.changeBuy),
        };
      }
      out.push({ bankName: bank.name, rates });
    }

    return out;
  } catch (error) {
    logger.warn({ error }, "Forex rates lookup failed; returning empty");
    return [];
  }
}

/**
 * Pull live Vietcombank rates and persist them.
 * Stores a snapshot row per currency and a daily rollup for history.
 */
export async function syncForexToDb(): Promise<number> {
  const rates = await forexAdapter.fetchCurrentRates();
  if (rates.length === 0) return 0;

  const bank = await prisma.bank.findUnique({
    where: { code: "VIETCOMBANK" },
  });
  if (!bank) {
    throw new Error("Bank VIETCOMBANK chưa được seed");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let synced = 0;

  for (const rate of rates) {
    const last = await prisma.exchangeRate.findFirst({
      where: { bankId: bank.id, currency: rate.currency },
      orderBy: { recordedAt: "desc" },
    });

    const changeBuy = last ? rate.buyRate - Number(last.buyRate) : 0;
    const changeSell = last ? rate.sellRate - Number(last.sellRate) : 0;

    await prisma.exchangeRate.create({
      data: {
        bankId: bank.id,
        currency: rate.currency,
        buyRate: rate.buyRate,
        sellRate: rate.sellRate,
        transferRate: rate.transferRate,
        changeBuy,
        changeSell,
        source: SOURCE,
        recordedAt: rate.recordedAt,
      },
    });

    await prisma.exchangeRateHistory.upsert({
      where: {
        bankId_currency_recordedAt: {
          bankId: bank.id,
          currency: rate.currency,
          recordedAt: today,
        },
      },
      create: {
        bankId: bank.id,
        currency: rate.currency,
        buyRate: rate.buyRate,
        sellRate: rate.sellRate,
        recordedAt: today,
      },
      update: {
        buyRate: rate.buyRate,
        sellRate: rate.sellRate,
      },
    });

    synced++;
  }

  logger.info({ synced }, "Forex rates synced to DB");
  return synced;
}
