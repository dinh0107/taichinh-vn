import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import type { BankCode, TermPeriod } from "@prisma/client";

const SOURCE = "curated";

// Terms shown on the public comparison table (KKH, 1m, 3m, 6m, 12m).
const PAGE_TERMS: TermPeriod[] = ["DEMAND", "M1", "M3", "M6", "M12"];

export type InterestBankRow = { name: string; rates: number[] };

/**
 * Latest interest rate per term, grouped by bank, ordered as PAGE_TERMS.
 * Returns only banks with data (empty => caller falls back to mock).
 */
export async function getInterestRatesByBank(): Promise<InterestBankRow[]> {
  const banks = await prisma.bank.findMany({ orderBy: { code: "asc" } });
  const out: InterestBankRow[] = [];

  for (const bank of banks) {
    const rows = await prisma.bankInterestRate.findMany({
      where: { bankId: bank.id, term: { in: PAGE_TERMS } },
      orderBy: { recordedAt: "desc" },
    });
    if (rows.length === 0) continue;

    const latest: Partial<Record<TermPeriod, number>> = {};
    for (const r of rows) {
      if (latest[r.term] == null) latest[r.term] = Number(r.rate);
    }
    out.push({
      name: bank.name,
      rates: PAGE_TERMS.map((t) => latest[t] ?? 0),
    });
  }

  return out;
}

// 12-month anchor rate (% / year) per bank — representative VN levels.
const ANCHOR_12M: Partial<Record<BankCode, number>> = {
  VIETCOMBANK: 4.7,
  BIDV: 4.7,
  AGRIBANK: 4.8,
  TECHCOMBANK: 5.0,
  MB_BANK: 5.1,
  ACB: 5.0,
  VP_BANK: 5.3,
};

// Offset (in % points) applied to the 12-month anchor per term.
const TERM_OFFSET: Partial<Record<TermPeriod, number>> = {
  DEMAND: -4.6,
  M1: -1.6,
  M3: -1.3,
  M6: -0.3,
  M9: -0.2,
  M12: 0,
  M18: 0.1,
  M24: 0.2,
  M36: 0.2,
};

function jitter(): number {
  return (Math.random() - 0.5) * 0.06;
}

/**
 * Persist representative deposit interest rates per bank/term.
 * There is no free public VN interest-rate API, so this uses a curated
 * baseline with light jitter. Swap in a real source by replacing this
 * function's data acquisition step.
 */
export async function syncInterestToDb(): Promise<number> {
  const banks = await prisma.bank.findMany();
  if (banks.length === 0) throw new Error("Chưa seed ngân hàng (Bank)");

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  let synced = 0;

  for (const bank of banks) {
    const anchor = ANCHOR_12M[bank.code];
    if (anchor == null) continue;

    for (const [term, offset] of Object.entries(TERM_OFFSET) as [
      TermPeriod,
      number,
    ][]) {
      const rate = Math.max(0.1, Number((anchor + offset + jitter()).toFixed(2)));

      await prisma.bankInterestRate.create({
        data: {
          bankId: bank.id,
          term,
          rate,
          source: SOURCE,
          recordedAt: now,
        },
      });

      await prisma.bankInterestRateHistory.upsert({
        where: {
          bankId_term_recordedAt: {
            bankId: bank.id,
            term,
            recordedAt: today,
          },
        },
        create: { bankId: bank.id, term, rate, recordedAt: today },
        update: { rate },
      });

      synced++;
    }
  }

  logger.info({ synced }, "Interest rates synced to DB");
  return synced;
}
