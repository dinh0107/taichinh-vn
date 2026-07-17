import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { verifyCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Kick off detached apply of deploy-build.tar.gz (CI uploaded).
 * Must be detached: the apply script kills this node process to unlock .next.
 *
 * POST /api/cron/apply-deploy-artifact
 * Authorization: Bearer CRON_SECRET
 */
export async function POST(request: NextRequest) {
  if (!(await verifyCronRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const root = process.cwd();
  const tarPath = path.join(root, "deploy-build.tar.gz");
  const tarParent = path.join(root, "..", "deploy-build.tar.gz");
  const bat = path.join(root, "scripts", "apply-deploy-tar.bat");

  const hasTar = fs.existsSync(tarPath) || fs.existsSync(tarParent);
  if (!hasTar) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing deploy-build.tar.gz — upload tar first, then call this API",
      },
      { status: 404 }
    );
  }
  if (!fs.existsSync(bat)) {
    return NextResponse.json(
      { success: false, error: `Missing ${bat}` },
      { status: 500 }
    );
  }

  const log = await prisma.cronJobLog.create({
    data: { jobName: "apply-deploy-artifact", status: "RUNNING" },
  });

  try {
    // Windows: detached cmd so kill of this node does not abort the apply script.
    const child = spawn("cmd.exe", ["/c", bat], {
      cwd: root,
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();

    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        durationMs: 0,
        error: "detached apply-deploy-tar.bat started",
      },
    });

    logger.info({ pid: child.pid }, "apply-deploy-artifact started detached");
    return NextResponse.json({
      success: true,
      started: true,
      pid: child.pid,
      message: "Detached apply started — poll CSS in ~30–90s",
    });
  } catch (error) {
    logger.error({ error }, "apply-deploy-artifact spawn failed");
    await prisma.cronJobLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        error: (error as Error).message,
      },
    });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
