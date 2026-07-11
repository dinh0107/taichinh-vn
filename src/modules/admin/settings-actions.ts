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
    const publicDir = path.join(process.cwd(), "public");
    await mkdir(publicDir, { recursive: true });
    const filename = TARGETS[kind];
    // Next.js serves from public/; IIS often looks at site root — write both.
    await writeFile(path.join(publicDir, filename), buffer);
    await writeFile(path.join(process.cwd(), filename), buffer);

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
  "gold_api_endpoint",
  "redis_url",
  "adsense_publisher_id",
  "gsc_property_url",
  "gsc_client_email",
  "head_scripts",
  "body_scripts",
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

export async function saveSettings(
  _prev: SaveSettingsState,
  formData: FormData
): Promise<SaveSettingsState> {
  await requireAdmin();

  const updates: { key: string; value: string }[] = [];

  for (const key of TEXT_KEYS) {
    const value = formData.get(key);
    if (typeof value === "string") updates.push({ key, value: value.trim() });
  }

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
