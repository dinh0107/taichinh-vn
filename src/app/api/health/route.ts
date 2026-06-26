import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    database: "down",
    redis: "down",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "up";
  } catch {
    checks.database = "down";
  }

  try {
    const redis = getRedis();
    await redis.ping();
    checks.redis = "up";
  } catch {
    checks.redis = "down";
  }

  const healthy = Object.values(checks).every((v) => v === "up");

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: checks,
      version: process.env.npm_package_version ?? "0.1.0",
    },
    { status: healthy ? 200 : 503 }
  );
}
