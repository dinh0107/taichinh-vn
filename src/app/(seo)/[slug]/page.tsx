import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildFinancialServiceSchema,
} from "@/lib/seo/schema";
import { canonicalUrlSync } from "@/lib/seo/site-url";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SeoLandingContent } from "@/components/seo/seo-landing-content";
import {
  getAllSeoSlugs,
  incrementSeoPageView,
  resolveSeoPage,
} from "@/modules/seo/service";
import { getSiteSettings } from "@/modules/admin/settings-service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllSeoSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [page, s] = await Promise.all([
    resolveSeoPage(slug),
    getSiteSettings(),
  ]);
  if (!page) return { title: "Không tìm thấy" };

  const siteName = s.site_name || "TaiChinh.vn";
  const v = s.brand_asset_version || "0";
  const icon = `/logo-icon.png?v=${v}`;
  const url = page.canonicalUrl ?? canonicalUrlSync(`/${slug}`);
  const rawTitle = page.ogTitle || page.title;
  const title =
    rawTitle.includes(siteName) || rawTitle.includes(" | ")
      ? rawTitle
      : `${rawTitle} | ${siteName}`;
  const description = page.ogDescription || page.metaDescription;

  const meta: Metadata = {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "vi_VN",
      url,
      siteName,
      images: page.ogImage
        ? [{ url: page.ogImage }]
        : [{ url: `/brand-wordmark.png?v=${v}`, alt: siteName }],
    },
    icons: {
      icon: [{ url: icon, type: "image/png" }],
      apple: [{ url: icon, type: "image/png" }],
    },
  };

  if (!page.isIndexed) {
    meta.robots = { index: false, follow: true };
  }

  return meta;
}

export default async function SeoLandingPage({ params }: Props) {
  const { slug } = await params;
  const [page, s] = await Promise.all([
    resolveSeoPage(slug),
    getSiteSettings(),
  ]);
  if (!page) notFound();

  void incrementSeoPageView(slug);

  const pageUrl = page.canonicalUrl ?? canonicalUrlSync(`/${slug}`);
  const homeUrl = canonicalUrlSync("/");
  const goldHubUrl = canonicalUrlSync("/gia-vang");
  const siteName = s.site_name || "TaiChinh.vn";

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: homeUrl },
      ...(page.pageType.startsWith("GOLD")
        ? [{ name: "Giá vàng", url: goldHubUrl }]
        : []),
      { name: page.title, url: pageUrl },
    ]),
    buildFinancialServiceSchema(page.title, page.metaDescription, siteName),
    ...(page.faqs.length > 0 ? [buildFaqSchema(page.faqs)] : []),
  ];

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <SeoLandingContent page={page} />
    </>
  );
}
