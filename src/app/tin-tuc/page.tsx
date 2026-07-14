import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { MarketPageShell } from "@/components/layout/market-page-shell";
import { getPublishedArticles } from "@/modules/news/service";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { PageBottomArticle } from "@/components/seo/page-bottom-article";
import { buildPageMetadata, MODULE_FAQS } from "@/lib/seo/metadata";
import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { formatDateVi } from "@/lib/time";
import { ArticleCoverImage } from "@/components/news/article-cover-image";

export const revalidate = 300;

const PAGE_TITLE = "Tin tức thị trường";
const PAGE_DESC =
  "Tin tức mới nhất về thị trường vàng, ngoại tệ, xăng dầu, lãi suất và hàng hóa.";

export async function generateMetadata() {
  return buildPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESC,
    path: "/tin-tuc",
  });
}

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  return (
    <MarketPageShell variant="news">
      <ModuleJsonLd
        path="/tin-tuc"
        serviceName={PAGE_TITLE}
        serviceDescription={PAGE_DESC}
        breadcrumbLabel="Tin tức"
        faqs={[...MODULE_FAQS.news]}
      />

      <PageHeader
        title="Tin tức thị trường"
        description="Tin tức mới nhất về thị trường vàng, ngoại tệ, xăng dầu, lãi suất, tiền ảo và hàng hóa."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Tin tức" }]}
        categoryLabel="Tin tức"
        badge={
          articles.length > 0
            ? `${articles.length} bài viết`
            : "Chưa có bài đăng"
        }
      />

      {articles.length === 0 ? (
        <section className="surface-card px-6 py-16 text-center">
          <p className="text-base font-semibold text-[var(--text-primary)]">
            Chưa có bài viết nào được đăng
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Tạo và xuất bản bài viết trong Admin → Bài viết để hiển thị tại đây.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {articles.map((article, i) => (
            <article key={article.slug} className="surface-card overflow-hidden">
              <Link
                href={`/tin-tuc/${article.slug}`}
                className="group grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]"
              >
                <div className="relative aspect-[16/10] bg-slate-100 md:aspect-auto md:min-h-[140px]">
                  {article.featuredImage ? (
                    <ArticleCoverImage
                      src={article.featuredImage}
                      alt={article.title}
                      sizes="220px"
                      className="transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full min-h-[140px] items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-sm font-semibold text-blue-600">
                      {i === 0 ? "Nổi bật" : "Tin"}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-blue-700">
                      {NEWS_CATEGORY_LABELS[article.category]}
                    </span>
                    <span>·</span>
                    <span>{formatDateVi(article.publishedAt)}</span>
                    {i === 0 && (
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                        Nổi bật
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-bold leading-snug text-[var(--text-primary)] group-hover:text-blue-700 md:text-xl">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </section>
      )}

      <PageBottomArticle slug="tin-tuc" />
    </MarketPageShell>
  );
}
