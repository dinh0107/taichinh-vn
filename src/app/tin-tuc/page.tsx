import { PageHeader } from "@/components/layout/page-header";
import { PageMain } from "@/components/ui/market-ui";
import { ArticleCard } from "@/components/news/article-card";
import { getPublishedArticles } from "@/modules/news/service";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { buildPageMetadataSync, MODULE_FAQS } from "@/lib/seo/metadata";
import { Newspaper } from "lucide-react";

export const revalidate = 300;

const PAGE_TITLE = "Tin tức tài chính";
const PAGE_DESC =
  "Tin tức giá vàng, chứng khoán, ngân hàng, bất động sản — tự động cập nhật.";

export const metadata = buildPageMetadataSync({
  title: PAGE_TITLE,
  description: PAGE_DESC,
  path: "/tin-tuc",
});

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  return (
    <>
      <ModuleJsonLd
        path="/tin-tuc"
        serviceName={PAGE_TITLE}
        serviceDescription={PAGE_DESC}
        breadcrumbLabel="Tin tức"
        faqs={[...MODULE_FAQS.news]}
      />
      <PageHeader
        title="Tin tức tài chính"
        description="Tổng hợp tin tức giá vàng, chứng khoán, ngân hàng và bất động sản — tự động cập nhật."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Tin tức" }]}
        icon={Newspaper}
        badge={
          articles.length > 0
            ? `${articles.length} bài viết`
            : "Chưa có bài đăng"
        }
      />

      <PageMain>
        {articles.length === 0 ? (
          <div className="rounded border border-dashed border-finance-300 bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold text-finance-900">
              Chưa có bài viết nào được đăng
            </p>
            <p className="mt-2 text-sm text-finance-500">
              Tạo và xuất bản bài viết trong Admin → Bài viết để hiển thị tại đây.
            </p>
          </div>
        ) : (
          <>
            <ArticleCard article={articles[0]} featured />
            {articles.length > 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                {articles.slice(1).map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}
          </>
        )}
      </PageMain>
    </>
  );
}
