import prisma from "@/lib/db";
import type { NewsCategoryCode } from "@prisma/client";
import { isNextProductionBuild } from "@/lib/build-phase";

const publishedWhere = {
  status: "PUBLISHED" as const,
  OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
};

export type PublicArticleSummary = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: NewsCategoryCode;
  featuredImage: string | null;
  publishedAt: Date | null;
  isAiGenerated: boolean;
};

export type PublicArticleDetail = PublicArticleSummary & {
  content: string;
  source: string | null;
  sourceUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  faqs: { question: string; answer: string }[];
};

export async function getPublishedArticles(
  limit = 50
): Promise<PublicArticleSummary[]> {
  if (isNextProductionBuild()) return [];
  try {
    return await prisma.newsArticle.findMany({
      where: publishedWhere,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        featuredImage: true,
        publishedAt: true,
        isAiGenerated: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getPublishedArticleBySlug(
  slug: string
): Promise<PublicArticleDetail | null> {
  try {
    const article = await prisma.newsArticle.findFirst({
      where: { slug, ...publishedWhere },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        category: true,
        featuredImage: true,
        publishedAt: true,
        isAiGenerated: true,
        source: true,
        sourceUrl: true,
        seoTitle: true,
        seoDescription: true,
        ogImage: true,
        faqs: {
          orderBy: { sortOrder: "asc" },
          select: { question: true, answer: true },
        },
      },
    });
    return article;
  } catch {
    return null;
  }
}

export async function getPublishedArticleSlugs(): Promise<string[]> {
  if (isNextProductionBuild()) return [];
  try {
    const rows = await prisma.newsArticle.findMany({
      where: publishedWhere,
      select: { slug: true },
      orderBy: { publishedAt: "desc" },
    });
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

export async function getRelatedArticles(
  slug: string,
  category: NewsCategoryCode,
  limit = 4
): Promise<PublicArticleSummary[]> {
  try {
    return await prisma.newsArticle.findMany({
      where: {
        ...publishedWhere,
        slug: { not: slug },
        category,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        featuredImage: true,
        publishedAt: true,
        isAiGenerated: true,
      },
    });
  } catch {
    return [];
  }
}
