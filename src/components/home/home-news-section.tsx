import Link from "next/link";
import { ArrowRight, Clock, Newspaper } from "lucide-react";
import type { PublicArticleSummary } from "@/modules/news/service";
import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { NEWS_CATEGORY_COLORS } from "@/modules/news/constants";
import { ClientRelativeTime } from "@/components/ui/client-relative-time";
import { ArticleCoverImage } from "@/components/news/article-cover-image";
import { appLinkHref } from "@/lib/seo/html-path";
import { cn } from "@/lib/utils";

export function HomeNewsSection({
  articles,
  title = "Tin tức thị trường",
  description = "Diễn biến mới về vàng, tài chính và kinh tế",
  href = "/tin-tuc",
}: {
  articles: PublicArticleSummary[];
  title?: string;
  description?: string;
  href?: string;
}) {
  if (articles.length === 0) {
    return (
      <section className="surface-card p-8 text-center">
        <Newspaper className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
        <h2 className="mt-3 text-xl font-bold text-[#02050e]">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">Chưa có bài viết mới.</p>
      </section>
    );
  }

  const [featured, ...rest] = articles;

  return (
    <section className="surface-card p-5 md:p-6">
      <header className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Newspaper className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#02050e]">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <Link
          href={href}
          className="group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-900"
        >
          Xem tất cả
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-12">
        <article className="overflow-hidden rounded-xl border border-[var(--border-soft)] lg:col-span-7">
          <Link
            href={appLinkHref(`/tin-tuc/${featured.slug}`)}
            className="group block h-full"
          >
            {featured.featuredImage ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <ArticleCoverImage
                  src={featured.featuredImage}
                  alt={featured.title}
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-blue-500">
                <Newspaper className="h-12 w-12" aria-hidden />
              </div>
            )}
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    NEWS_CATEGORY_COLORS[featured.category]
                  )}
                >
                  {NEWS_CATEGORY_LABELS[featured.category]}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-600">
                  Mới nhất
                </span>
              </div>
              <h3 className="mt-2 text-lg font-bold leading-snug text-[#02050e] transition-colors group-hover:text-blue-700 md:text-xl">
                {featured.title}
              </h3>
              {featured.excerpt && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {featured.excerpt}
                </p>
              )}
              <p className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <ClientRelativeTime date={featured.publishedAt} />
              </p>
            </div>
          </Link>
        </article>

        <div className="lg:col-span-5">
          <ul className="divide-y divide-slate-100">
            {rest.slice(0, 5).map((article) => (
              <li key={article.slug}>
                <Link
                  href={appLinkHref(`/tin-tuc/${article.slug}`)}
                  className="group flex min-h-24 gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {article.featuredImage ? (
                      <ArticleCoverImage
                        src={article.featuredImage}
                        alt={article.title}
                        sizes="112px"
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-slate-300">
                        <Newspaper className="h-6 w-6" aria-hidden />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                      {NEWS_CATEGORY_LABELS[article.category]}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-blue-700">
                      {article.title}
                    </h3>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" aria-hidden />
                      <ClientRelativeTime date={article.publishedAt} />
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
