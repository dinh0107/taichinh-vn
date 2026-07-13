import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailView } from "@/components/news/article-detail-view";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildNewsArticleSchema,
} from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/utils";
import {
  getPublishedArticleBySlug,
  getPublishedArticleSlugs,
  getRelatedArticles,
} from "@/modules/news/service";
import { getSiteSettings } from "@/modules/admin/settings-service";

export const revalidate = 60;
/** Allow newly published slugs that were not in the last build. */
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPublishedArticleSlugs();
  return slugs.map((slug) => ({ slug }));
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
    <>
      <JsonLdScript data={jsonLd} />
      <ArticleDetailView article={article} related={related} />
    </>
  );
}
