import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";
import {
  SETTING_DEFAULTS,
  parseAiConfig,
  type AiConfig,
  type SiteSettings,
} from "./settings-shared";
import { isNextProductionBuild } from "@/lib/build-phase";

const SECRET_KEYS = ["cron_secret", "openai_api_key", "gsc_private_key"] as const;

/** Cache tag for on-demand ISR invalidation after admin settings changes. */
export const SITE_SETTINGS_TAG = "site-settings";

async function fetchSiteSettingsFromDb(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map: SiteSettings = { ...SETTING_DEFAULTS };
    for (const row of rows) {
      const legacyValue = row.value.trim().toLowerCase();
      if (row.key === "site_name" && legacyValue === "taichinh.vn") {
        map[row.key] = SETTING_DEFAULTS.site_name;
      } else if (
        row.key === "site_url" &&
        /^https?:\/\/(www\.)?taichinh\.vn\/?$/.test(legacyValue)
      ) {
        map[row.key] = SETTING_DEFAULTS.site_url;
      } else {
        map[row.key] = row.value;
      }
    }
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
  if (!flags.openai_api_key && process.env.OPENAI_API_KEY?.trim()) {
    flags.openai_api_key = true;
  }
  return flags;
}

/** Typed AI settings for cron / article generation (includes API key when present). */
export async function getAiConfig(): Promise<AiConfig> {
  const settings = await getSiteSettingsFresh();
  let apiKey: string | null = null;
  if (!isNextProductionBuild()) {
    try {
      const row = await prisma.siteSetting.findUnique({
        where: { key: "openai_api_key" },
        select: { value: true },
      });
      apiKey = row?.value?.trim() || null;
    } catch {
      apiKey = null;
    }
  }
  if (!apiKey && process.env.OPENAI_API_KEY?.trim()) {
    apiKey = process.env.OPENAI_API_KEY.trim();
  }
  return parseAiConfig(settings, apiKey);
}
