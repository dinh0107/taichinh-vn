import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { syncGscToDatabase } from "@/modules/admin/gsc-sync";
import { isGscEnabled } from "@/lib/gsc/feature";
import { verifyCronRequest } from "@/lib/cron-auth";

export async function POST(request: NextRequest) {
  if (!isGscEnabled()) {
    return NextResponse.json(
      { error: "GSC integration is disabled (GSC_ENABLED=false)" },
      { status: 503 }
    );
  }

  if (!(await verifyCronRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const log = await prisma.cronJobLog.create({
    data: { jobName: "sync-gsc", status: "RUNNING" },
  });

  const start = Date.now();

  try {
    const result = await syncGscToDatabase();
    const hasErrors = result.errors > 0 || /Analytics lỗi:/i.test(result.message);
    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: hasErrors && result.inspected === 0 ? "FAILED" : "SUCCESS",
        finishedAt: new Date(),
        durationMs: Date.now() - start,
        recordsSync: result.inspected,
        // Surface GSC error details in Admin → Cron logs (not only pino).
        error: hasErrors ? result.message : null,
      },
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ err: error }, "Cron sync-gsc failed");
    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        durationMs: Date.now() - start,
        error: message,
      },
    });
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
