import { ArticleStatus, NewsCategoryCode } from "@prisma/client";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";
import {
  fetch24hArticle,
  fetch24hGoldList,
  SOURCE_NAME,
} from "@/modules/news/adapters/24h-gold";

export type Ingest24hResult = {
  listed: number;
  created: number;
  skipped: number;
  failed: number;
  errors: string[];
};

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || `tin-24h-${Date.now()}`;
  let slug = root;
  let i = 1;
  while (true) {
    const existing = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${root}-${i++}`;
  }
}

/**
 * Crawl 24h gold category and publish new articles (dedupe by sourceUrl).
 */
export async function ingest24hGoldNews(opts?: {
  limit?: number;
}): Promise<Ingest24hResult> {
  const limit = opts?.limit ?? 10;
  const result: Ingest24hResult = {
    listed: 0,
    created: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  const list = await fetch24hGoldList(limit);
  result.listed = list.length;

  for (const item of list) {
    try {
      const existing = await prisma.newsArticle.findFirst({
        where: { sourceUrl: item.url },
        select: { id: true },
      });
      if (existing) {
        result.skipped += 1;
        continue;
      }

      const article = await fetch24hArticle(item.url);
      const slug = await uniqueSlug(article.title);

      await prisma.newsArticle.create({
        data: {
          title: article.title,
          slug,
          excerpt: article.excerpt || null,
          content: article.contentHtml,
          category: NewsCategoryCode.GOLD,
          source: SOURCE_NAME,
          sourceUrl: article.url,
          featuredImage: article.image,
          ogImage: article.image,
          status: ArticleStatus.PUBLISHED,
          isAiGenerated: false,
          seoTitle: article.title.slice(0, 70),
          seoDescription: (article.excerpt || article.title).slice(0, 160),
          publishedAt: new Date(),
        },
      });

      result.created += 1;
      // polite delay between detail fetches
      await new Promise((r) => setTimeout(r, 800));
    } catch (e) {
      result.failed += 1;
      const msg = e instanceof Error ? e.message : String(e);
      result.errors.push(`${item.url}: ${msg}`);
      logger.warn({ err: e, url: item.url }, "24h ingest article failed");
    }
  }

  return result;
}
