import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { verifyCronRequest } from "@/lib/cron-auth";
import { writeDailyAiArticle } from "@/modules/ai/daily-article";
import { revalidatePath } from "next/cache";
import { NewsCategoryCode } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const JOB_NAME = "ai-write-articles";

export async function POST(request: NextRequest) {
  if (!(await verifyCronRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let force = false;
  let category: NewsCategoryCode | undefined;
  try {
    const body = (await request.json()) as {
      force?: boolean;
      category?: string;
    };
    force = Boolean(body.force);
    if (
      body.category &&
      Object.values(NewsCategoryCode).includes(body.category as NewsCategoryCode)
    ) {
      category = body.category as NewsCategoryCode;
    }
  } catch {
    // empty body is fine
  }

  const log = await prisma.cronJobLog.create({
    data: { jobName: JOB_NAME, status: "RUNNING" },
  });
  const start = Date.now();

  try {
    const result = await writeDailyAiArticle({ force, category });

    if (result.created && result.status === "PUBLISHED") {
      revalidatePath("/tin-tuc");
      revalidatePath("/");
      if (result.slug) revalidatePath(`/tin-tuc/${result.slug}`);
    }

    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        durationMs: Date.now() - start,
        recordsSync: result.created ? 1 : 0,
        error: result.skipped ? result.reason ?? null : null,
      },
    });

    return NextResponse.json({
      success: true,
      ...result,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    logger.error({ error }, "AI daily article cron failed");
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
