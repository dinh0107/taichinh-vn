import { NextRequest, NextResponse } from "next/server";
import { syncGoldPricesToDb } from "@/modules/gold/service";
import { syncForexToDb } from "@/modules/forex/service";
import { syncStocksToDb } from "@/modules/stocks/service";
import { syncInterestToDb } from "@/modules/interest/service";
import { syncFuelToDb } from "@/modules/fuel/service";
import prisma from "@/lib/db";
import { cacheDel } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { getCurrentUser, isAdminRole } from "@/lib/auth";

const SYNC_HANDLERS: Record<
  string,
  { jobName: string; run: () => Promise<number> }
> = {
  gold: {
    jobName: "sync-gold-prices",
    run: syncGoldPricesToDb,
  },
  forex: {
    jobName: "sync-forex",
    run: syncForexToDb,
  },
  stocks: {
    jobName: "sync-stocks",
    run: syncStocksToDb,
  },
  interest: {
    jobName: "sync-interest",
    run: syncInterestToDb,
  },
  fuel: {
    jobName: "sync-fuel",
    run: syncFuelToDb,
  },
};

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let moduleKey: string;
  try {
    const body = await request.json();
    moduleKey = body.module as string;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const handler = SYNC_HANDLERS[moduleKey];
  if (!handler) {
    return NextResponse.json(
      { error: `Module "${moduleKey}" chưa hỗ trợ đồng bộ` },
      { status: 501 }
    );
  }

  const log = await prisma.cronJobLog.create({
    data: { jobName: handler.jobName, status: "RUNNING" },
  });

  const start = Date.now();

  try {
    const synced = await handler.run();
    await cacheDel(`${moduleKey}:*`);

    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        durationMs: Date.now() - start,
        recordsSync: synced,
      },
    });

    return NextResponse.json({
      success: true,
      module: moduleKey,
      synced,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    logger.error({ error, module: moduleKey }, "Admin sync failed");

    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        durationMs: Date.now() - start,
        error: (error as Error).message,
      },
    });

    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
