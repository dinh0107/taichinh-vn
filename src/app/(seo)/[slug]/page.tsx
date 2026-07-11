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
  const page = await resolveSeoPage(slug);
  if (!page) return { title: "Không tìm thấy" };

  const url = page.canonicalUrl ?? canonicalUrlSync(`/${slug}`);
  const title = page.ogTitle || page.title;
  const description = page.ogDescription || page.metaDescription;

  const meta: Metadata = {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "vi_VN",
      url,
      ...(page.ogImage ? { images: [{ url: page.ogImage }] } : {}),
    },
  };

  if (!page.isIndexed) {
    meta.robots = { index: false, follow: true };
  }

  return meta;
}

export default async function SeoLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = await resolveSeoPage(slug);
  if (!page) notFound();

  void incrementSeoPageView(slug);

  const pageUrl = page.canonicalUrl ?? canonicalUrlSync(`/${slug}`);
  const homeUrl = canonicalUrlSync("/");
  const goldHubUrl = canonicalUrlSync("/gia-vang");

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: homeUrl },
      ...(page.pageType.startsWith("GOLD")
        ? [{ name: "Giá vàng", url: goldHubUrl }]
        : []),
      { name: page.title, url: pageUrl },
    ]),
    buildFinancialServiceSchema(page.title, page.metaDescription),
    ...(page.faqs.length > 0 ? [buildFaqSchema(page.faqs)] : []),
  ];

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <SeoLandingContent page={page} />
    </>
  );
}
