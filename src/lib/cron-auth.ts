import type { NextRequest } from "next/server";
import prisma from "@/lib/db";

/**
 * Accepts Authorization: Bearer <secret>
 * Secret from (in order):
 * 1. process.env.CRON_SECRET
 * 2. Admin → Cài đặt → CRON_SECRET (site_settings.cron_secret)
 */
export async function verifyCronRequest(request: NextRequest): Promise<boolean> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    // Dev convenience when nothing is configured yet
    if (process.env.NODE_ENV === "development" && !process.env.CRON_SECRET) {
      return true;
    }
    return false;
  }

  const token = auth.slice("Bearer ".length).trim();
  if (!token) return false;

  const envSecret = process.env.CRON_SECRET?.trim();
  if (envSecret && token === envSecret) return true;

  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "cron_secret" },
      select: { value: true },
    });
    const dbSecret = row?.value?.trim();
    if (dbSecret && token === dbSecret) return true;
  } catch {
    // ignore DB errors — fall through
  }

  return false;
}
