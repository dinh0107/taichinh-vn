import { NextRequest, NextResponse } from "next/server";
import { syncGoldPricesToDb } from "@/modules/gold/service";
import prisma from "@/lib/db";
import { cacheDel } from "@/lib/redis";
import { logger } from "@/lib/logger";

function verifyCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobName = "sync-gold-prices";
  const log = await prisma.cronJobLog.create({
    data: { jobName, status: "RUNNING" },
  });

  const start = Date.now();

  try {
    const synced = await syncGoldPricesToDb();
    await cacheDel("gold:*");

    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        durationMs: Date.now() - start,
        recordsSync: synced,
      },
    });

    return NextResponse.json({ success: true, synced, durationMs: Date.now() - start });
  } catch (error) {
    logger.error({ error }, "Gold sync cron failed");

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
