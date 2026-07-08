import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { syncGscToDatabase } from "@/modules/admin/gsc-sync";
import { isGscEnabled } from "@/lib/gsc/feature";

export async function POST(request: NextRequest) {
  if (!isGscEnabled()) {
    return NextResponse.json(
      { error: "GSC integration is disabled (GSC_ENABLED=false)" },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const log = await prisma.cronJobLog.create({
    data: { jobName: "sync-gsc", status: "RUNNING" },
  });

  const start = Date.now();

  try {
    const result = await syncGscToDatabase();
    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        durationMs: Date.now() - start,
        recordsSync: result.inspected,
      },
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    logger.error({ error }, "Cron sync-gsc failed");
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
