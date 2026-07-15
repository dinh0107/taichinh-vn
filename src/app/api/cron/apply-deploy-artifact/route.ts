import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { verifyCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

const requireCwd = createRequire(path.join(process.cwd(), "package.json"));
const { syncNextStatic } = requireCwd("./scripts/sync-next-static.js") as {
  syncNextStatic: (root: string) => {
    ok: boolean;
    files: number;
    css: number;
    error?: string;
  };
};

function countCss(root: string): number {
  const base = path.join(root, ".next", "static");
  if (!fs.existsSync(base)) return 0;
  let n = 0;
  const walk = (d: string) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith(".css")) n += 1;
    }
  };
  walk(base);
  return n;
}

function touchWebConfig(root: string) {
  const wc = path.join(root, "web.config");
  if (!fs.existsSync(wc)) return;
  const now = new Date();
  try {
    fs.utimesSync(wc, now, now);
  } catch {
    /* ignore */
  }
}

/**
 * After Git pull (may wipe untracked .next), extract CI tar + sync CSS for IIS.
 * POST /api/cron/apply-deploy-artifact
 */
export async function POST(request: NextRequest) {
  if (!(await verifyCronRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobName = "apply-deploy-artifact";
  const log = await prisma.cronJobLog.create({
    data: { jobName, status: "RUNNING" },
  });
  const start = Date.now();
  const root = process.cwd();
  const tarPath = path.join(root, "deploy-build.tar.gz");

  try {
    if (!fs.existsSync(tarPath)) {
      throw new Error(
        `Missing deploy-build.tar.gz in ${root} — upload tar AFTER git webhook`
      );
    }

    const nextDir = path.join(root, ".next");
    if (fs.existsSync(nextDir)) {
      try {
        fs.rmSync(nextDir, { recursive: true, force: true });
      } catch (e) {
        logger.warn({ e }, "Could not fully remove .next before extract");
      }
    }

    const tar = spawnSync("tar", ["-xzf", tarPath], {
      cwd: root,
      encoding: "utf8",
      shell: true,
    });
    if (tar.status !== 0) {
      throw new Error(
        `tar extract failed: ${tar.stderr || tar.stdout || tar.status}`
      );
    }

    try {
      fs.unlinkSync(tarPath);
    } catch {
      /* ignore */
    }

    const synced = syncNextStatic(root);
    if (!synced.ok) {
      throw new Error(`syncNextStatic failed: ${synced.error || "unknown"}`);
    }
    const css = countCss(root);
    if (css < 1) {
      throw new Error("No CSS under .next/static after extract");
    }

    touchWebConfig(root);

    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        durationMs: Date.now() - start,
        recordsSync: synced.files,
      },
    });

    return NextResponse.json({
      success: true,
      files: synced.files,
      css,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    logger.error({ error }, "apply-deploy-artifact failed");
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
