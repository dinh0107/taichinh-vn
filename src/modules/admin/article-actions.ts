"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { requireAdmin, touchSession } from "@/lib/auth";
import { NewsCategoryCode, ArticleStatus } from "@prisma/client";

export type ArticleFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const articleSchema = z.object({
  title: z.string().trim().min(5, "Tiêu đề tối thiểu 5 ký tự"),
  slug: z.string().trim().optional(),
  category: z.nativeEnum(NewsCategoryCode),
  status: z.nativeEnum(ArticleStatus),
  excerpt: z.string().trim().optional(),
  content: z
    .string()
    .trim()
    .refine((html) => {
      const text = html
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      return text.length >= 20;
    }, "Nội dung tối thiểu 20 ký tự"),
  source: z.string().trim().optional(),
  sourceUrl: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^https?:\/\//i.test(v),
      "URL nguồn không hợp lệ (cần http/https)"
    ),
  featuredImage: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^https?:\/\//i.test(v),
      "URL ảnh không hợp lệ (cần http/https)"
    ),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  isAiGenerated: z.boolean().optional(),
  publishedAt: z.string().trim().optional(),
});

function parseForm(formData: FormData) {
  return articleSchema.safeParse({
    title: formData.get("title") ?? "",
    slug: formData.get("slug") ?? "",
    category: formData.get("category") ?? "",
    status: formData.get("status") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content") ?? "",
    source: formData.get("source") ?? "",
    sourceUrl: formData.get("sourceUrl") ?? "",
    featuredImage: formData.get("featuredImage") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    isAiGenerated: formData.get("isAiGenerated") === "on",
    publishedAt: formData.get("publishedAt") ?? "",
  });
}

function zodToFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || `bai-viet-${Date.now()}`;
  let slug = root;
  let i = 1;
  while (true) {
    const existing = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${root}-${i++}`;
  }
}

function resolvePublishedAt(
  status: ArticleStatus,
  raw: string | undefined,
  current?: Date | null
): Date | null {
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (status === "PUBLISHED") return current ?? new Date();
  return current ?? null;
}

export async function createArticle(
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireAdmin();
  await touchSession();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
  }
  const data = parsed.data;
  let slug = "";
  let id = "";

  try {
    slug = await uniqueSlug(data.slug || data.title);
    const created = await prisma.newsArticle.create({
      data: {
        slug,
        title: data.title,
        excerpt: data.excerpt || null,
        content: data.content,
        category: data.category,
        status: data.status,
        isAiGenerated: data.isAiGenerated ?? false,
        source: data.source || null,
        sourceUrl: data.sourceUrl || null,
        featuredImage: data.featuredImage || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        publishedAt: resolvePublishedAt(data.status, data.publishedAt),
      },
    });
    id = created.id;
  } catch (e) {
    logger.error({ e }, "Create article failed");
    return { ok: false, error: "Không thể tạo bài viết. Vui lòng thử lại." };
  }

  revalidatePath("/admin/bai-viet");
  revalidatePath("/tin-tuc");
  revalidatePath(`/tin-tuc/${slug}`);

  // Always stay in admin after save (avoids session drops on public redirect).
  redirect(`/admin/bai-viet/${id}/xem`);
}

export async function updateArticle(
  id: string,
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireAdmin();
  await touchSession();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
  }
  const data = parsed.data;
  let slug = "";
  let previousSlug = "";

  try {
    const current = await prisma.newsArticle.findUnique({ where: { id } });
    if (!current) return { ok: false, error: "Không tìm thấy bài viết." };

    previousSlug = current.slug;
    slug = await uniqueSlug(data.slug || data.title, id);
    await prisma.newsArticle.update({
      where: { id },
      data: {
        slug,
        title: data.title,
        excerpt: data.excerpt || null,
        content: data.content,
        category: data.category,
        status: data.status,
        isAiGenerated: data.isAiGenerated ?? false,
        source: data.source || null,
        sourceUrl: data.sourceUrl || null,
        featuredImage: data.featuredImage || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        publishedAt: resolvePublishedAt(
          data.status,
          data.publishedAt,
          current.publishedAt
        ),
      },
    });
  } catch (e) {
    logger.error({ e }, "Update article failed");
    return { ok: false, error: "Không thể cập nhật bài viết." };
  }

  revalidatePath("/admin/bai-viet");
  revalidatePath("/tin-tuc");
  revalidatePath(`/tin-tuc/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/tin-tuc/${previousSlug}`);
  }

  redirect(`/admin/bai-viet/${id}/xem`);
}

export async function deleteArticle(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  let slug = "";
  try {
    const article = await prisma.newsArticle.findUnique({
      where: { id },
      select: { slug: true },
    });
    slug = article?.slug ?? "";
    await prisma.newsArticle.delete({ where: { id } });
  } catch (e) {
    logger.error({ e }, "Delete article failed");
    return;
  }

  revalidatePath("/admin/bai-viet");
  revalidatePath("/tin-tuc");
  if (slug) revalidatePath(`/tin-tuc/${slug}`);
}
