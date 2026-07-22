import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { verifyCronRequest } from "@/lib/cron-auth";
import { writeDailyAiArticle } from "@/modules/ai/daily-article";
import { getAiConfig } from "@/modules/admin/settings-service";
import { revalidatePath } from "next/cache";
import { NewsCategoryCode } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const JOB_NAME = "ai-write-articles";
/** Bumped when AI client behavior changes — use to verify live deploy. */
const AI_CLIENT = "or-v1";

function readBuildId(): string | null {
  try {
    return readFileSync(
      path.join(process.cwd(), ".next", "BUILD_ID"),
      "utf8"
    ).trim();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyCronRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let force = false;
  let scheduled = false;
  let category: NewsCategoryCode | undefined;
  try {
    const body = (await request.json()) as {
      force?: boolean;
      scheduled?: boolean;
      category?: string;
    };
    force = Boolean(body.force);
    scheduled = Boolean(body.scheduled);
    if (
      body.category &&
      Object.values(NewsCategoryCode).includes(body.category as NewsCategoryCode)
    ) {
      category = body.category as NewsCategoryCode;
    }
  } catch {
    // empty body is fine — treated as manual (no hour gate)
  }

  const log = await prisma.cronJobLog.create({
    data: { jobName: JOB_NAME, status: "RUNNING" },
  });
  const start = Date.now();
  const buildId = readBuildId();

  try {
    const cfg = await getAiConfig();
    const result = await writeDailyAiArticle({ force, scheduled, category });

    if (result.created && result.status === "PUBLISHED") {
      revalidatePath("/tin-tuc");
      revalidatePath("/");
      revalidatePath("/feed.xml");
      revalidatePath("/feed/news.xml");
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
      aiClient: AI_CLIENT,
      buildId,
      provider: cfg.provider,
      baseUrl: cfg.baseUrl,
      model: cfg.model,
      ...result,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    logger.error({ error }, "AI daily article cron failed");
    let provider: string | undefined;
    let baseUrl: string | undefined;
    try {
      const cfg = await getAiConfig();
      provider = cfg.provider;
      baseUrl = cfg.baseUrl;
    } catch {
      /* ignore */
    }
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
      {
        success: false,
        aiClient: AI_CLIENT,
        buildId,
        provider,
        baseUrl,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
