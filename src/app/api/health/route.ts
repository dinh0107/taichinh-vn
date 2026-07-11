import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getRedis, isRedisEnabled } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    database: "down",
    redis: isRedisEnabled() ? "down" : "skipped",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "up";
  } catch {
    checks.database = "down";
  }

  if (isRedisEnabled()) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.ping();
        checks.redis = "up";
      }
    } catch {
      checks.redis = "down";
    }
  }

  // Site is healthy if DB works; Redis is optional
  const healthy = checks.database === "up";

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: checks,
      version: process.env.npm_package_version ?? "0.1.0",
    },
    { status: healthy ? 200 : 503 }
  );
}
