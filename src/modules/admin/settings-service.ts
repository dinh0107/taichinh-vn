import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";
import { SETTING_DEFAULTS, type SiteSettings } from "./settings-shared";
import { isNextProductionBuild } from "@/lib/build-phase";

const SECRET_KEYS = ["cron_secret", "openai_api_key", "gsc_private_key"] as const;

/** Cache tag for on-demand ISR invalidation after admin settings changes. */
export const SITE_SETTINGS_TAG = "site-settings";

async function fetchSiteSettingsFromDb(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map: SiteSettings = { ...SETTING_DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
    return map;
  } catch {
    return { ...SETTING_DEFAULTS };
  }
}

const getCachedSiteSettings = unstable_cache(
  fetchSiteSettingsFromDb,
  ["site-settings"],
  { revalidate: 300, tags: [SITE_SETTINGS_TAG] }
);

/** Public/ISR-safe settings (cached ~5 minutes, tag-invalidated on save). */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (isNextProductionBuild()) return { ...SETTING_DEFAULTS };
  return getCachedSiteSettings();
}

/** Uncached settings for admin forms (always read latest from DB). */
export async function getSiteSettingsFresh(): Promise<SiteSettings> {
  if (isNextProductionBuild()) return { ...SETTING_DEFAULTS };
  return fetchSiteSettingsFromDb();
}

/** Whether a secret value already exists (so the UI can show "đã thiết lập"). */
export async function getSecretFlags(): Promise<Record<string, boolean>> {
  const flags: Record<string, boolean> = {};
  for (const key of SECRET_KEYS) flags[key] = false;
  if (isNextProductionBuild()) return flags;

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
