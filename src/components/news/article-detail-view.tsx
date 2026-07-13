import Link from "next/link";
import { ChevronRight, Clock, ExternalLink, Sparkles } from "lucide-react";
import { ArticleBody } from "@/components/news/article-body";
import { ArticleCard } from "@/components/news/article-card";
import { ArticleCoverImage } from "@/components/news/article-cover-image";
import { PageMain } from "@/components/ui/market-ui";
import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { NEWS_CATEGORY_COLORS } from "@/modules/news/constants";
import type {
  PublicArticleDetail,
  PublicArticleSummary,
} from "@/modules/news/service";
import { formatDateVi, formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";

export function ArticleDetailView({
  article,
  related = [],
  preview = false,
}: {
  article: PublicArticleDetail;
  related?: PublicArticleSummary[];
  preview?: boolean;
}) {
  const publishedLabel = article.publishedAt
    ? `${formatDateVi(article.publishedAt)} · ${formatRelativeTime(article.publishedAt)}`
    : "Chưa đặt ngày đăng";

  return (
    <>
      {preview && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
          Đang xem trước — bài chưa công khai trên{" "}
          <Link href="/tin-tuc" className="font-semibold underline">
            /tin-tuc
          </Link>
          .
        </div>
      )}

      <div className="border-b border-finance-200 bg-finance-hero bg-finance-grid text-white">
        <div className="container-page py-8 md:py-10">
          <nav className="flex items-center gap-1 text-xs text-finance-400">
            <Link href="/" className="hover:text-gold-400">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <Link href="/tin-tuc" className="hover:text-gold-400">
              Tin tức
            </Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="line-clamp-1 text-finance-300">{article.title}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold",
                NEWS_CATEGORY_COLORS[article.category]
              )}
            >
              {NEWS_CATEGORY_LABELS[article.category]}
            </span>
            {article.isAiGenerated && (
              <span className="label-caps text-finance-400">
                <Sparkles className="mr-1 inline h-3 w-3" /> AI
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-finance-500">
              <Clock className="h-3.5 w-3.5" />
              {publishedLabel}
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl text-2xl font-semibold leading-tight md:text-3xl">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-finance-400 md:text-base">
              {article.excerpt}
            </p>
          )}

          {article.source && (
            <p className="mt-4 text-xs text-finance-500">
              Nguồn:{" "}
              {article.sourceUrl ? (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-gold-400 hover:underline"
                >
                  {article.source}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-finance-300">{article.source}</span>
              )}
            </p>
          )}
        </div>
      </div>

      {article.featuredImage && (
        <div className="border-b border-finance-200 bg-finance-50">
          <div className="container-page py-5">
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded border border-finance-200">
              <ArticleCoverImage
                src={article.featuredImage}
                alt={article.title}
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          </div>
        </div>
      )}

      <PageMain>
        <div className="mx-auto max-w-3xl space-y-10">
          <article className="rounded border border-finance-200 bg-white p-6 shadow-sm md:p-10">
            <ArticleBody html={article.content} />
          </article>

          {article.faqs.length > 0 && (
            <section className="rounded border border-finance-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-lg font-semibold text-finance-900">
                Câu hỏi thường gặp
              </h2>
              <div className="mt-4 divide-y divide-finance-100">
                {article.faqs.map((faq, i) => (
                  <details key={i} className="group py-4">
                    <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-finance-800 marker:content-none group-open:text-gold-700">
                      {faq.question}
                      <ChevronRight className="h-4 w-4 shrink-0 text-finance-400 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-finance-600">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-finance-900">
                Bài viết liên quan
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {related.map((item) => (
                  <ArticleCard key={item.slug} article={item} />
                ))}
              </div>
            </section>
          )}

          <div className="flex justify-center border-t border-finance-100 pt-6">
            <Link
              href="/tin-tuc"
              className="text-sm font-semibold text-finance-600 hover:text-gold-700"
            >
              ← Về danh sách tin tức
            </Link>
          </div>
        </div>
      </PageMain>
    </>
  );
}
