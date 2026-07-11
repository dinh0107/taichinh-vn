import prisma from "@/lib/db";
import { SETTING_DEFAULTS, type SiteSettings } from "./settings-shared";

const SECRET_KEYS = ["cron_secret", "openai_api_key", "gsc_private_key"] as const;

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map: SiteSettings = { ...SETTING_DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
    return map;
  } catch {
    return { ...SETTING_DEFAULTS };
  }
}

/** Whether a secret value already exists (so the UI can show "đã thiết lập"). */
export async function getSecretFlags(): Promise<Record<string, boolean>> {
  const flags: Record<string, boolean> = {};
  for (const key of SECRET_KEYS) flags[key] = false;
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: [...SECRET_KEYS] } },
      select: { key: true, value: true },
    });
    for (const row of rows) flags[row.key] = row.value.trim().length > 0;
  } catch {
    // keep defaults (all false)
  }
  return flags;
}
