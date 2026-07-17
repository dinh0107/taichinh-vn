"use server";

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/db";
import { SITE_SETTINGS_TAG } from "./settings-service";
import {
  type SaveSettingsState,
  type UploadState,
} from "./settings-shared";
import { readPngSize } from "@/lib/png-size";

function revalidatePublicSite() {
  revalidateTag(SITE_SETTINGS_TAG, "max");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/gia-vang");
  revalidatePath("/ty-gia");
  revalidatePath("/lai-suat");
  revalidatePath("/chung-khoan");
  revalidatePath("/gia-xang");
  revalidatePath("/tin-tuc");
}

// Canonical public asset names already referenced across the site
// (root layout icons + SiteHeader wordmark).
const TARGETS = {
  logo: "brand-wordmark.png",
  favicon: "logo-icon.png",
} as const;

type AssetKind = keyof typeof TARGETS;

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png"];

export async function uploadBrandAsset(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  await requireAdmin();

  const kind = formData.get("kind") as AssetKind | null;
  const file = formData.get("file");

  if (!kind || !(kind in TARGETS)) {
    return { ok: false, error: "Loại tệp không hợp lệ." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Vui lòng chọn một tệp ảnh." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Tệp vượt quá giới hạn 2MB." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Chỉ hỗ trợ định dạng PNG." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Google Search: favicon must be square (≥48px). Reject wordmarks here.
    if (kind === "favicon") {
      const size = readPngSize(buffer);
      if (!size) {
        return { ok: false, error: "Không đọc được PNG. Vui lòng chọn file PNG hợp lệ." };
      }
      if (size.width !== size.height) {
        return {
          ok: false,
          error: `Favicon phải là ảnh vuông (hiện ${size.width}×${size.height}). Google sẽ không hiện icon nếu không vuông.`,
        };
      }
      if (size.width < 48) {
        return {
          ok: false,
          error: `Favicon tối thiểu 48×48px (hiện ${size.width}×${size.height}).`,
        };
      }
    }

    const publicDir = path.join(process.cwd(), "public");
    await mkdir(publicDir, { recursive: true });
    const filename = TARGETS[kind];
    // Next.js serves from public/; IIS often looks at site root — write both.
    await writeFile(path.join(publicDir, filename), buffer);
    await writeFile(path.join(process.cwd(), filename), buffer);
    if (kind === "favicon") {
      // Stable URL for Googlebot / browsers that only request /favicon.ico
      await writeFile(path.join(publicDir, "favicon.ico"), buffer);
      await writeFile(path.join(process.cwd(), "favicon.ico"), buffer);
    }

    const version = String(Date.now());
    await prisma.siteSetting.upsert({
      where: { key: "brand_asset_version" },
      create: { key: "brand_asset_version", value: version },
      update: { value: version },
    });

    revalidatePublicSite();
    revalidatePath("/admin/cai-dat");
    revalidatePath("/api/brand/icon");
    revalidatePath("/api/brand/logo");

    logger.info({ kind, size: file.size, version }, "Brand asset uploaded");
    return {
      ok: true,
      message: kind === "logo" ? "Đã cập nhật logo." : "Đã cập nhật favicon.",
      version: Number(version),
    };
  } catch (error) {
    logger.error({ error: (error as Error).message, kind }, "Brand upload failed");
    return { ok: false, error: "Lưu tệp thất bại. Vui lòng thử lại." };
  }
}

// Plain text fields always overwritten with submitted value.
const TEXT_KEYS = [
  "site_name",
  "site_url",
  "site_description",
  "site_phone",
  "gold_api_endpoint",
  "redis_url",
  "adsense_publisher_id",
  "gsc_property_url",
  "gsc_client_email",
  "head_scripts",
  "body_scripts",
  "ai_provider",
  "ai_base_url",
  "ai_model",
  "ai_temperature",
  "ai_max_tokens",
  "ai_cron_hour",
  "ai_publish_mode",
  "ai_system_prompt",
  "ai_article_prompt",
] as const;

// Secret fields: only overwritten when a new non-empty value is provided.
const SECRET_KEYS = ["cron_secret", "openai_api_key", "gsc_private_key"] as const;

const BOOL_KEYS = [
  "enable_adsense",
  "enable_ad_banner",
  "enable_affiliate",
  "ai_auto_write",
  "ai_auto_summarize",
  "ai_auto_faq",
] as const;

const AI_CATEGORY_VALUES = new Set([
  "GOLD",
  "STOCKS",
  "BANKING",
  "REAL_ESTATE",
  "ECONOMY",
  "GENERAL",
]);

function clampNumber(
  raw: string,
  min: number,
  max: number,
  fallback: number,
  integer = false
): string {
  if (!raw.trim()) return String(fallback);
  const n = Number(raw);
  if (!Number.isFinite(n)) return String(fallback);
  const clamped = Math.min(max, Math.max(min, n));
  return String(integer ? Math.round(clamped) : clamped);
}

export async function saveSettings(
  _prev: SaveSettingsState,
  formData: FormData
): Promise<SaveSettingsState> {
  await requireAdmin();

  const updates: { key: string; value: string }[] = [];

  for (const key of TEXT_KEYS) {
    const value = formData.get(key);
    if (typeof value !== "string") continue;
    let v = value.trim();
    if (key === "ai_temperature") v = clampNumber(v, 0, 2, 0.7);
    if (key === "ai_max_tokens") v = clampNumber(v, 256, 8000, 2000, true);
    if (key === "ai_cron_hour") v = clampNumber(v, 0, 23, 7, true);
    if (key === "ai_publish_mode") v = v === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    if (key === "ai_provider") {
      const p = v.toLowerCase();
      v = p === "openrouter" || p === "openai" || p === "auto" ? p : "auto";
    }
    if (key === "ai_base_url") v = v.replace(/\/+$/, "");
    updates.push({ key, value: v });
  }

  const cats = formData
    .getAll("ai_write_categories")
    .filter((v): v is string => typeof v === "string" && AI_CATEGORY_VALUES.has(v));
  updates.push({
    key: "ai_write_categories",
    value: cats.length > 0 ? cats.join(",") : "GOLD",
  });

  for (const key of BOOL_KEYS) {
    updates.push({ key, value: formData.get(key) === "on" ? "true" : "false" });
  }

  for (const key of SECRET_KEYS) {
    const value = formData.get(key);
    // Skip empty input or unchanged mask so we never wipe an existing secret.
    if (typeof value === "string" && value.trim() && !/^•+$/.test(value.trim())) {
      updates.push({ key, value: value.trim() });
    }
  }

  try {
    await prisma.$transaction(
      updates.map((u) =>
        prisma.siteSetting.upsert({
          where: { key: u.key },
          create: { key: u.key, value: u.value },
          update: { value: u.value },
        })
      )
    );

    revalidatePublicSite();
    revalidatePath("/admin/cai-dat");
    logger.info({ count: updates.length }, "Site settings saved");
    return { ok: true, message: "Đã lưu cài đặt." };
  } catch (error) {
    logger.error({ error: (error as Error).message }, "Save settings failed");
    return { ok: false, error: "Lưu cài đặt thất bại. Vui lòng thử lại." };
  }
}
