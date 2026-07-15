import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { NEWS_CATEGORY_COLORS } from "@/modules/news/constants";
import { ClientRelativeTime } from "@/components/ui/client-relative-time";
import type { PublicArticleSummary } from "@/modules/news/service";
import { cn } from "@/lib/utils";
import { ArticleCoverImage } from "@/components/news/article-cover-image";
import { appLinkHref } from "@/lib/seo/html-path";

export function ArticleCard({
  article,
  featured = false,
}: {
  article: PublicArticleSummary;
  featured?: boolean;
}) {
  const categoryLabel = NEWS_CATEGORY_LABELS[article.category];
  const excerpt =
    article.excerpt?.trim() ||
    "Nhấn để đọc nội dung đầy đủ bài viết.";
  // Soft-nav href: App Router path only (no .html) — avoids rewrite bounce.
  const href = appLinkHref(`/tin-tuc/${article.slug}`);

  if (featured) {
    return (
      <Link
        href={href}
        className="card-hover group block overflow-hidden rounded-2xl border border-finance-200 bg-white shadow-sm"
      >
        {article.featuredImage && (
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-finance-100">
            <ArticleCoverImage
              src={article.featuredImage}
              alt={article.title}
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold",
                NEWS_CATEGORY_COLORS[article.category]
              )}
            >
              {categoryLabel}
            </span>
            {article.isAiGenerated && (
              <span className="label-caps inline-flex items-center gap-1 text-finance-400">
                <Sparkles className="h-3 w-3" /> AI
              </span>
            )}
          </div>
          <h2 className="mt-3 max-w-3xl text-xl font-bold leading-snug text-finance-900 group-hover:text-brand-700 md:text-2xl">
            {article.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-finance-500 line-clamp-2">
            {excerpt}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-finance-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <ClientRelativeTime date={article.publishedAt} />
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-brand-600">
              Đọc tiếp
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="card-hover group flex h-full flex-col gap-2 rounded border border-finance-200 bg-white p-5 shadow-sm"
    >
      {article.featuredImage && (
        <div className="relative mb-1 aspect-video w-full overflow-hidden rounded">
          <ArticleCoverImage src={article.featuredImage} alt={article.title} />
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold",
            NEWS_CATEGORY_COLORS[article.category]
          )}
        >
          {categoryLabel}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-finance-400">
          <Clock className="h-3 w-3" />
          <ClientRelativeTime date={article.publishedAt} />
        </span>
      </div>
      <h2 className="text-sm font-semibold leading-snug text-finance-900 group-hover:text-gold-700">
        {article.title}
      </h2>
      <p className="flex-1 text-xs text-finance-500 line-clamp-3">{excerpt}</p>
      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-finance-600 group-hover:text-gold-600">
        Đọc tiếp{" "}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
