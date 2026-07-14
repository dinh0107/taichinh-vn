import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, ExternalLink, Sparkles } from "lucide-react";
import { ArticleBody } from "@/components/news/article-body";
import { ArticleCard } from "@/components/news/article-card";
import { ArticleCoverImage } from "@/components/news/article-cover-image";
import { MarketPageShell } from "@/components/layout/market-page-shell";
import { ModuleSection } from "@/components/layout/page-header";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildNewsArticleSchema,
} from "@/lib/seo/schema";
import { absoluteUrl, cn } from "@/lib/utils";
import { formatDateVi, formatRelativeTime } from "@/lib/time";
import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { NEWS_CATEGORY_COLORS } from "@/modules/news/constants";
import {
  getPublishedArticleBySlug,
  getRelatedArticles,
} from "@/modules/news/service";
import { getSiteSettings } from "@/modules/admin/settings-service";

export const revalidate = 60;
/** Allow newly published slugs that were not in the last build. */
export const dynamicParams = true;
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [article, s] = await Promise.all([
    getPublishedArticleBySlug(slug),
    getSiteSettings(),
  ]);
  if (!article) return { title: "Không tìm thấy" };

  const siteName = s.site_name || "TaiChinh.vn";
  const v = s.brand_asset_version || "0";
  const icon = `/api/brand/icon?v=${v}`;
  const title = article.seoTitle || article.title;
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const description =
    article.seoDescription ||
    article.excerpt ||
    `${article.title} — Tin tức tài chính ${siteName}`;
  const image =
    article.ogImage ||
    article.featuredImage ||
    `/api/brand/logo?v=${v}`;

  return {
    title: { absolute: fullTitle },
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: "article",
      locale: "vi_VN",
      siteName,
      publishedTime: article.publishedAt?.toISOString(),
      images: [{ url: image }],
    },
    icons: {
      icon: [{ url: icon, type: "image/png" }],
      apple: [{ url: icon, type: "image/png" }],
    },
    alternates: { canonical: absoluteUrl(`/tin-tuc/${slug}`) },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const [article, settings] = await Promise.all([
    getPublishedArticleBySlug(slug),
    getSiteSettings(),
  ]);
  if (!article) notFound();

  const related = await getRelatedArticles(slug, article.category);
  const siteName = settings.site_name || "TaiChinh.vn";
  const publishedLabel = article.publishedAt
    ? `${formatDateVi(article.publishedAt)} · ${formatRelativeTime(article.publishedAt)}`
    : formatRelativeTime(article.publishedAt);

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: absoluteUrl("/") },
      { name: "Tin tức", url: absoluteUrl("/tin-tuc") },
      { name: article.title, url: absoluteUrl(`/tin-tuc/${slug}`) },
    ]),
    buildNewsArticleSchema({
      title: article.title,
      description: article.excerpt || article.seoDescription || article.title,
      url: absoluteUrl(`/tin-tuc/${slug}`),
      image: article.ogImage || article.featuredImage,
      publishedAt: article.publishedAt,
      siteName,
    }),
    ...(article.faqs.length > 0 ? [buildFaqSchema(article.faqs)] : []),
  ];

  return (
    <MarketPageShell variant="news">
      <JsonLdScript data={jsonLd} />

      <header className="space-y-4">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span className="text-[var(--text-muted)]">/</span>
          <Link href="/tin-tuc" className="hover:text-blue-600">
            Tin tức
          </Link>
          <span className="text-[var(--text-muted)]">/</span>
          <span className="line-clamp-1 font-medium text-[var(--text-primary)]">
            {article.title}
          </span>
        </nav>

        <div className="surface-card p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold",
                NEWS_CATEGORY_COLORS[article.category]
              )}
            >
              {NEWS_CATEGORY_LABELS[article.category]}
            </span>
            {article.isAiGenerated && (
              <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                <Sparkles className="mr-1 h-3 w-3" /> AI
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <Clock className="h-3.5 w-3.5" />
              {publishedLabel}
            </span>
          </div>

          <h1 className="mt-4 text-[24px] font-bold leading-[1.25] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[28px]">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
              {article.excerpt}
            </p>
          )}

          {article.source && (
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Nguồn:{" "}
              {article.sourceUrl ? (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
                >
                  {article.source}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span>{article.source}</span>
              )}
            </p>
          )}
        </div>
      </header>

      {article.featuredImage && (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)]">
          <div className="relative aspect-[21/9] w-full bg-slate-100">
            <ArticleCoverImage
              src={article.featuredImage}
              alt={article.title}
              priority
              sizes="(max-width: 1200px) 100vw, 900px"
            />
          </div>
        </div>
      )}

      <article className="surface-card p-6 md:p-10">
        <ArticleBody html={article.content} />
      </article>

      {article.faqs.length > 0 && (
        <ModuleSection title="Câu hỏi thường gặp">
          <div className="divide-y divide-slate-100">
            {article.faqs.map((faq, i) => (
              <details key={i} className="group py-3">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-[var(--text-primary)] marker:content-none">
                  {faq.question}
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </ModuleSection>
      )}

      {related.length > 0 && (
        <ModuleSection title="Bài viết liên quan">
          <div className="grid gap-4 md:grid-cols-2">
            {related.map((item) => (
              <ArticleCard key={item.slug} article={item} />
            ))}
          </div>
        </ModuleSection>
      )}
    </MarketPageShell>
  );
}
