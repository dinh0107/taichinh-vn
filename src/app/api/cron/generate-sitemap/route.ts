import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { verifyCronRequest } from "@/lib/cron-auth";
import { generateSitemap } from "@/modules/seo/generate-sitemap";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const JOB_NAME = "generate-sitemap";

export async function POST(request: NextRequest) {
  if (!(await verifyCronRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const log = await prisma.cronJobLog.create({
    data: { jobName: JOB_NAME, status: "RUNNING" },
  });
  const start = Date.now();

  try {
    const result = await generateSitemap({ warm: true });

    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        durationMs: Date.now() - start,
        recordsSync: result.urls,
      },
    });

    return NextResponse.json({
      success: true,
      ...result,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    logger.error({ error }, "generate-sitemap cron failed");
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
