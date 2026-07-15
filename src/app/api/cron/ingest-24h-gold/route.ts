import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { verifyCronRequest } from "@/lib/cron-auth";
import { ingest24hGoldNews } from "@/modules/news/ingest-24h";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  if (!(await verifyCronRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobName = "ingest-24h-gold-news";
  const log = await prisma.cronJobLog.create({
    data: { jobName, status: "RUNNING" },
  });
  const start = Date.now();

  try {
    const result = await ingest24hGoldNews({ limit: 10 });
    revalidatePath("/tin-tuc");
    revalidatePath("/");
    revalidatePath("/gia-vang");

    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        durationMs: Date.now() - start,
        recordsSync: result.created,
      },
    });

    return NextResponse.json({
      success: true,
      ...result,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    logger.error({ error }, "24h gold news ingest cron failed");
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
