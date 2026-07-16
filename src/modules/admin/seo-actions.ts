"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";
import { SeoPageType } from "@prisma/client";
import { syncSeoTemplatesFromCatalog } from "./seo-service";
import { SEO_TEMPLATES, isModuleHubSlug } from "./seo-templates";
import { pageArticleDefBySlug } from "./page-articles";
import { syncGscToDatabase } from "./gsc-sync";
import { isGscEnabled } from "@/lib/gsc/feature";

export type SeoFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
};

const seoSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Slug tối thiểu 3 ký tự")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  pageType: z.nativeEnum(SeoPageType),
  title: z.string().trim().min(5, "Tiêu đề tối thiểu 5 ký tự"),
  metaDescription: z.string().trim().min(20, "Meta description tối thiểu 20 ký tự"),
  h1: z.string().trim().min(5, "H1 tối thiểu 5 ký tự"),
  canonicalUrl: z
    .string()
    .trim()
    .url("Canonical URL không hợp lệ")
    .optional()
    .or(z.literal("")),
  ogTitle: z.string().trim().optional(),
  ogDescription: z.string().trim().optional(),
  ogImage: z
    .string()
    .trim()
    .url("OG image URL không hợp lệ")
    .optional()
    .or(z.literal("")),
  isIndexed: z.boolean().optional(),
  faqPayload: z.string().trim().optional(),
  content: z.string().optional(),
});

function zodToFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

function parseFaqs(raw: string | undefined): { question: string; answer: string }[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const q = "question" in item ? String(item.question).trim() : "";
        const a = "answer" in item ? String(item.answer).trim() : "";
        if (!q || !a) return null;
        return { question: q, answer: a };
      })
      .filter((x): x is { question: string; answer: string } => x !== null);
  } catch {
    return [];
  }
}

function parseForm(formData: FormData) {
  return seoSchema.safeParse({
    slug: slugify(String(formData.get("slug") ?? "")),
    pageType: formData.get("pageType") ?? "",
    title: formData.get("title") ?? "",
    metaDescription: formData.get("metaDescription") ?? "",
    h1: formData.get("h1") ?? "",
    canonicalUrl: formData.get("canonicalUrl") ?? "",
    ogTitle: formData.get("ogTitle") ?? "",
    ogDescription: formData.get("ogDescription") ?? "",
    ogImage: formData.get("ogImage") ?? "",
    isIndexed: formData.get("isIndexed") === "on",
    faqPayload: formData.get("faqPayload") ?? "",
    content: String(formData.get("content") ?? ""),
  });
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || `seo-${Date.now()}`;
  let slug = root;
  let i = 1;
  while (true) {
    const existing = await prisma.seoPage.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${root}-${i++}`;
  }
}

async function saveFaqs(seoPageId: string, faqs: { question: string; answer: string }[]) {
  await prisma.seoFaq.deleteMany({ where: { seoPageId } });
  if (faqs.length === 0) return;
  await prisma.seoFaq.createMany({
    data: faqs.map((f, i) => ({
      seoPageId,
      question: f.question,
      answer: f.answer,
      sortOrder: i,
    })),
  });
}

function revalidateSeoPaths(slug: string) {
  revalidatePath("/admin/seo");
  revalidatePath("/sitemap.xml");
  if (slug === "home" || isModuleHubSlug(slug)) {
    const hub = pageArticleDefBySlug(slug);
    revalidatePath(hub?.path ?? "/");
    return;
  }
  revalidatePath(`/${slug}`);
}

export async function createSeoPage(
  _prev: SeoFormState,
  formData: FormData
): Promise<SeoFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
  }
  const data = parsed.data;
  const faqs = parseFaqs(data.faqPayload);

  try {
    const slug = await uniqueSlug(data.slug);
    const page = await prisma.seoPage.create({
      data: {
        slug,
        pageType: data.pageType,
        title: data.title,
        metaDescription: data.metaDescription,
        h1: data.h1,
        content: data.content ?? "",
        canonicalUrl: data.canonicalUrl || null,
        ogTitle: data.ogTitle || null,
        ogDescription: data.ogDescription || null,
        ogImage: data.ogImage || null,
        isIndexed: data.isIndexed ?? true,
        isAutoGenerated: false,
      },
    });
    await saveFaqs(page.id, faqs);
    revalidateSeoPaths(slug);
  } catch (e) {
    logger.error({ e }, "Create SEO page failed");
    return { ok: false, error: "Không thể tạo landing page." };
  }

  redirect("/admin/seo");
}

export async function updateSeoPage(
  id: string,
  _prev: SeoFormState,
  formData: FormData
): Promise<SeoFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
  }
  const data = parsed.data;
  const faqs = parseFaqs(data.faqPayload);

  try {
    const current = await prisma.seoPage.findUnique({ where: { id } });
    if (!current) return { ok: false, error: "Không tìm thấy landing page." };

    const slug = await uniqueSlug(data.slug, id);
    await prisma.seoPage.update({
      where: { id },
      data: {
        slug,
        pageType: data.pageType,
        title: data.title,
        metaDescription: data.metaDescription,
        h1: data.h1,
        content: data.content ?? "",
        canonicalUrl: data.canonicalUrl || null,
        ogTitle: data.ogTitle || null,
        ogDescription: data.ogDescription || null,
        ogImage: data.ogImage || null,
        isIndexed: data.isIndexed ?? true,
        isAutoGenerated: false,
      },
    });
    await saveFaqs(id, faqs);
    revalidateSeoPaths(slug);
    if (current.slug !== slug) revalidateSeoPaths(current.slug);
  } catch (e) {
    logger.error({ e }, "Update SEO page failed");
    return { ok: false, error: "Không thể cập nhật landing page." };
  }

  redirect("/admin/seo");
}

export async function deleteSeoPage(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  try {
    const page = await prisma.seoPage.findUnique({
      where: { id },
      select: { slug: true },
    });
    await prisma.seoPage.delete({ where: { id } });
    if (page?.slug) revalidateSeoPaths(page.slug);
  } catch (e) {
    logger.error({ e }, "Delete SEO page failed");
  }
}

export async function syncSeoTemplates(): Promise<SeoFormState> {
  await requireAdmin();

  try {
    const result = await syncSeoTemplatesFromCatalog();
    revalidatePath("/admin/seo");
    revalidatePath("/sitemap.xml");
    for (const t of SEO_TEMPLATES) {
      revalidateSeoPaths(t.slug);
    }

    let message = `Đồng bộ xong: ${result.created} mới, ${result.updated} cập nhật, ${result.skipped} giữ nguyên (chỉnh tay).`;
    if (result.failed > 0) {
      message += ` ${result.failed} lỗi.`;
      if (result.errors[0]) message += ` Chi tiết: ${result.errors[0]}`;
    }

    return {
      ok: result.failed === 0,
      message: result.failed === 0 ? message : undefined,
      error: result.failed > 0 ? message : undefined,
    };
  } catch (e) {
    logger.error({ e }, "Sync SEO templates failed");
    const detail =
      e instanceof Error ? e.message.split("\n")[0]?.slice(0, 200) : null;
    return {
      ok: false,
      error: detail
        ? `Không thể đồng bộ template SEO: ${detail}`
        : "Không thể đồng bộ template SEO. Kiểm tra DATABASE_URL / chạy prisma db push.",
    };
  }
}

export async function syncGscStatus(): Promise<SeoFormState> {
  await requireAdmin();

  if (!isGscEnabled()) {
    return {
      ok: false,
      error: "Google Search Console đang tạm tắt (GSC_ENABLED chưa bật).",
    };
  }

  try {
    const result = await syncGscToDatabase();
    revalidatePath("/admin/seo");
    return { ok: true, message: result.message };
  } catch (e) {
    logger.error({ e }, "Sync GSC failed");
    const raw = e instanceof Error ? e.message : "Không thể đồng bộ Google Search Console.";
    // Short toast-friendly line
    const error = raw.split("\n")[0]?.slice(0, 280) || raw;
    return { ok: false, error };
  }
}

export async function revalidateSeoSitemap(): Promise<SeoFormState> {
  await requireAdmin();
  revalidatePath("/sitemap.xml");
  return { ok: true, message: "Đã làm mới sitemap.xml." };
}

export async function toggleSeoIndex(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  try {
    const page = await prisma.seoPage.findUnique({ where: { id } });
    if (!page) return;
    await prisma.seoPage.update({
      where: { id },
      data: { isIndexed: !page.isIndexed },
    });
    revalidateSeoPaths(page.slug);
  } catch (e) {
    logger.error({ e }, "Toggle SEO index failed");
  }
}

/** Settings page: save bottom article HTML for trang chủ (slug=home). */
export async function saveHomePageArticle(
  _prev: SeoFormState,
  formData: FormData
): Promise<SeoFormState> {
  await requireAdmin();

  const content = String(formData.get("content") ?? "");
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { ok: false, error: "Thiếu trang chủ SEO. Thử tải lại trang." };
  }

  try {
    const page = await prisma.seoPage.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!page || page.slug !== "home") {
      return { ok: false, error: "Không tìm thấy trang chủ." };
    }

    await prisma.seoPage.update({
      where: { id: page.id },
      data: {
        content,
        isAutoGenerated: false,
      },
    });
    revalidateSeoPaths("home");
    return { ok: true, message: "Đã lưu bài viết trang chủ." };
  } catch (e) {
    logger.error({ e }, "Save home page article failed");
    return { ok: false, error: "Không thể lưu bài viết trang chủ." };
  }
}
