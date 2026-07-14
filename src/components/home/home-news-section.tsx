import Link from "next/link";
import { Clock } from "lucide-react";
import type { PublicArticleSummary } from "@/modules/news/service";
import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { ClientRelativeTime } from "@/components/ui/client-relative-time";
import { ArticleCoverImage } from "@/components/news/article-cover-image";

export function HomeNewsSection({
  articles,
}: {
  articles: PublicArticleSummary[];
}) {
  if (articles.length === 0) {
    return (
      <section className="surface-card p-8 text-center">
        <h2 className="text-xl font-bold text-[#02050e]">Tin tức thị trường</h2>
        <p className="mt-2 text-sm text-slate-500">
          Cập nhật những tin nóng ảnh hưởng trực tiếp đến giá
        </p>
      </section>
    );
  }

  const [featured, ...rest] = articles;

  return (
    <section className="surface-card p-5 md:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#02050e]">Tin tức thị trường</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Cập nhật những tin nóng ảnh hưởng trực tiếp đến giá
          </p>
        </div>
        <Link
          href="/tin-tuc"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Link
          href={`/tin-tuc/${featured.slug}`}
          className="group overflow-hidden rounded-xl border border-[var(--border-soft)]"
        >
          {featured.featuredImage ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <ArticleCoverImage
                src={featured.featuredImage}
                alt={featured.title}
                sizes="(max-width: 1024px) 100vw, 560px"
                className="transition duration-300 group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-sm font-semibold text-blue-600">
              Nổi bật
            </div>
          )}
          <div className="p-4">
            <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
              Nổi bật
            </span>
            <h3 className="mt-2 text-base font-bold leading-snug text-[#02050e] group-hover:text-blue-700 md:text-lg">
              {featured.title}
            </h3>
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <ClientRelativeTime date={featured.publishedAt} />
            </p>
          </div>
        </Link>

        <ul className="divide-y divide-slate-100">
          {rest.slice(0, 4).map((a) => (
            <li key={a.slug}>
              <Link
                href={`/tin-tuc/${a.slug}`}
                className="group flex gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {NEWS_CATEGORY_LABELS[a.category]}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-800 transition group-hover:text-blue-700">
                    {a.title}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    <ClientRelativeTime date={a.publishedAt} />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
