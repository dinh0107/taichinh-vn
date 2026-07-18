import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildFinancialServiceSchema,
  buildWebPageSchema,
  generateGoldFaqs,
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
import {
  filterGoldPrices,
  getCurrentGoldPrices,
} from "@/modules/gold/service";
import { GoldBrandCode, GoldPurity } from "@prisma/client";
import { withHomNayTitlePrefix } from "@/lib/time";
import { absoluteUrl } from "@/lib/utils";
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

  const siteName = s.site_name || "Giá Hôm Nay";
  const v = s.brand_asset_version || "0";
  const url = page.canonicalUrl ?? canonicalUrlSync(`/${slug}`);
  const title = withHomNayTitlePrefix(
    page.ogTitle || page.title,
    undefined,
    siteName
  );
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
        : [{ url: `/api/brand/logo?v=${v}`, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [page.ogImage || `/api/brand/logo?v=${v}`],
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
  const siteName = s.site_name || "Giá Hôm Nay";
  const v = s.brand_asset_version || "0";
  const brandImage = absoluteUrl(`/api/brand/logo?v=${v}`);

  const hubCrumb =
    page.pageType.startsWith("GOLD")
      ? { name: "Giá vàng", url: canonicalUrlSync("/gia-vang") }
      : page.pageType.startsWith("FX")
        ? { name: "Tỷ giá", url: canonicalUrlSync("/ty-gia") }
        : page.pageType.startsWith("INTEREST")
          ? { name: "Lãi suất", url: canonicalUrlSync("/lai-suat") }
          : page.pageType.startsWith("STOCK")
            ? { name: "Chứng khoán", url: canonicalUrlSync("/chung-khoan") }
            : page.pageType.startsWith("FUEL")
              ? { name: "Xăng dầu", url: canonicalUrlSync("/gia-xang") }
              : null;

  let faqs = page.faqs;
  if (faqs.length === 0 && page.pageType.startsWith("GOLD")) {
    const all = await getCurrentGoldPrices();
    const filtered = filterGoldPrices(all, {
      brand: page.config.brand as GoldBrandCode | undefined,
      purity: page.config.purity as GoldPurity | undefined,
    });
    faqs = generateGoldFaqs(filtered.length > 0 ? filtered : all);
  } else if (faqs.length === 0 && page.config.currency) {
    const c = page.config.currency;
    faqs = [
      {
        question: `Tỷ giá ${c}/VND hôm nay?`,
        answer: `Xem bảng tỷ giá mua/bán ${c} tại các ngân hàng trên trang này.`,
      },
    ];
  }

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: homeUrl },
      ...(hubCrumb ? [hubCrumb] : []),
      { name: page.title, url: pageUrl },
    ]),
    buildWebPageSchema({
      name: page.h1 || page.title,
      description: page.metaDescription,
      url: pageUrl,
      siteName,
    }),
    buildArticleSchema({
      title: page.title,
      description: page.metaDescription,
      url: pageUrl,
      image: page.ogImage || brandImage,
      siteName,
      authorName: siteName,
      articleSection: hubCrumb?.name,
    }),
    buildFinancialServiceSchema(page.title, page.metaDescription, siteName, {
      image: brandImage,
      telephone: s.site_phone?.trim() || undefined,
    }),
    ...(faqs.length > 0 ? [buildFaqSchema(faqs)] : []),
  ];

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <SeoLandingContent page={page} />
    </>
  );
}
