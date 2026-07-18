import { absoluteUrl } from "@/lib/utils";
import { siteBaseUrlSync } from "@/lib/seo/site-url";
import { todayDateVi, goldMoiNhatTitle, GOLD_MOI_NHAT_TITLE_BASE } from "@/lib/time";
import type { GoldPriceItem } from "@/modules/gold/types";

export type JsonLd = Record<string, unknown>;

export function buildBreadcrumbSchema(items: { name: string; url: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqSchema(faqs: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Standalone WebPage — pairs with Breadcrumb / Article on content pages. */
export function buildWebPageSchema(input: {
  name: string;
  description: string;
  url: string;
  siteName?: string;
  dateModified?: Date | string | null;
  datePublished?: Date | string | null;
}): JsonLd {
  const siteName = input.siteName || "Giá Hôm Nay";
  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: "vi",
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: absoluteUrl("/"),
    },
  };
  const published = toIso(input.datePublished);
  const modified = toIso(input.dateModified) || published;
  if (published) schema.datePublished = published;
  if (modified) schema.dateModified = modified;
  return schema;
}

/** Generic Article (programmatic SEO / info pages). News uses NewsArticle. */
export function buildArticleSchema(input: {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  publishedAt?: Date | string | null;
  modifiedAt?: Date | string | null;
  siteName?: string;
  authorName?: string | null;
  articleSection?: string | null;
}): JsonLd {
  const siteName = input.siteName || "Giá Hôm Nay";
  const logoUrl = absoluteUrl("/api/brand/logo");
  const published = toIso(input.publishedAt);
  const modified = toIso(input.modifiedAt) || published;
  const authorName = input.authorName?.trim() || siteName;

  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: input.url,
    inLanguage: "vi",
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      name: authorName,
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: absoluteUrl("/"),
      logo: brandLogoImageObject(logoUrl),
    },
    // Always include crawlable on-site image (Googlebot often can't fetch hotlinked CDN images).
    image: buildArticleImages(input.image, logoUrl),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
  };
  if (published) schema.datePublished = published;
  if (modified) schema.dateModified = modified;
  if (input.articleSection?.trim()) {
    schema.articleSection = input.articleSection.trim();
  }
  return schema;
}

function toIso(value?: Date | string | null): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  const s = String(value).trim();
  if (!s) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00.000Z`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/**
 * Free price-lookup service (not a storefront LocalBusiness).
 * Avoid FinancialService/LocalBusiness — Google flags missing review/aggregateRating.
 */
export function buildFinancialServiceSchema(
  name: string,
  description: string,
  siteName = "Giá Hôm Nay",
  opts?: { image?: string; telephone?: string; url?: string }
): JsonLd {
  const image = opts?.image?.trim() || absoluteUrl("/api/brand/logo");
  const telephone = opts?.telephone?.trim() || undefined;
  const pageUrl = opts?.url?.trim() || absoluteUrl("/");

  const provider: JsonLd = {
    "@type": "Organization",
    name: siteName,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: image,
    },
  };
  if (telephone) provider.telephone = telephone;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    alternateName: siteName,
    description,
    url: pageUrl,
    image,
    serviceType: "Tra cứu giá tài chính",
    provider,
    areaServed: {
      "@type": "Country",
      name: "Vietnam",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      description: "Miễn phí",
    },
  };
}

/** Sitewide Organization — logo, name, homepage. */
export function buildOrganizationSchema(
  siteName = "Giá Hôm Nay",
  opts?: { image?: string; telephone?: string; description?: string }
): JsonLd {
  const image = opts?.image?.trim() || absoluteUrl("/api/brand/logo");
  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: image,
    },
    image,
  };
  if (opts?.description?.trim()) schema.description = opts.description.trim();
  if (opts?.telephone?.trim()) schema.telephone = opts.telephone.trim();
  return schema;
}

/** Sitewide WebSite + SearchAction pointing at /tin-tuc. */
export function buildWebSiteSchema(
  siteName = "Giá Hôm Nay",
  opts?: { description?: string }
): JsonLd {
  const home = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: home,
    description: opts?.description?.trim() || undefined,
    inLanguage: "vi",
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: home,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/tin-tuc")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Gold quotes as Dataset — avoid Product (GSC wants fake review/aggregateRating). */
export function buildGoldPriceSchema(prices: GoldPriceItem[]): JsonLd {
  const sjc = prices.find((p) => p.code === "SJL1L10");
  const formatVnd = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + " đ/lượng";

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Giá vàng SJC 9999 Việt Nam",
    description: sjc
      ? `Giá vàng SJC 9999 mới nhất: mua ${formatVnd(sjc.buy)}, bán ${formatVnd(sjc.sell)}.`
      : "Giá vàng SJC 9999 mới nhất tại Việt Nam",
    url: absoluteUrl("/gia-vang"),
    inLanguage: "vi",
    creator: {
      "@type": "Organization",
      name: "Giá Hôm Nay",
      url: absoluteUrl("/"),
    },
    temporalCoverage: new Date().toISOString().slice(0, 10),
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "Giá mua SJC",
        value: sjc?.buy,
        unitText: "VND/lượng",
      },
      {
        "@type": "PropertyValue",
        name: "Giá bán SJC",
        value: sjc?.sell,
        unitText: "VND/lượng",
      },
    ].filter((v) => v.value != null),
  };
}

export function generateGoldFaqs(prices: GoldPriceItem[]): { question: string; answer: string }[] {
  const sjc = prices.find((p) => p.code === "SJL1L10");
  const world = prices.find((p) => p.code === "XAUUSD");
  const doji = prices.find((p) => p.code === "DOHNL");
  const pnj = prices.find((p) => p.code === "PQHNVM");

  const formatVnd = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + " đ/lượng";

  return [
    {
      question: "Giá vàng SJC hôm nay bao nhiêu?",
      answer: sjc
        ? `Giá vàng SJC 9999 hôm nay: Mua ${formatVnd(sjc.buy)}, Bán ${formatVnd(sjc.sell)}.`
        : "Đang cập nhật giá vàng SJC.",
    },
    {
      question: "Giá vàng DOJI hôm nay?",
      answer: doji
        ? `Giá vàng DOJI: Mua ${formatVnd(doji.buy)}, Bán ${formatVnd(doji.sell)}.`
        : "Đang cập nhật giá vàng DOJI.",
    },
    {
      question: "Giá vàng PNJ hôm nay?",
      answer: pnj
        ? `Giá vàng PNJ: Mua ${formatVnd(pnj.buy)}, Bán ${formatVnd(pnj.sell)}.`
        : "Đang cập nhật giá vàng PNJ.",
    },
    {
      question: "Giá vàng thế giới hôm nay?",
      answer: world
        ? `Giá vàng thế giới (XAU/USD): ${world.buy.toFixed(2)} USD/oz.`
        : "Đang cập nhật giá vàng thế giới.",
    },
    {
      question: "Nên mua vàng SJC hay DOJI?",
      answer:
        "Tùy thuộc vào mục đích đầu tư và vị trí địa lý. SJC là thương hiệu quốc gia, thanh khoản cao. DOJI có mạng lưới rộng. Hãy so sánh giá mua/bán trước khi quyết định.",
    },
    {
      question: "Giá vàng cập nhật bao lâu một lần?",
      answer:
        "Giá vàng được cập nhật mỗi 5 phút từ các nguồn dữ liệu uy tín.",
    },
  ];
}

export function buildNewsArticleSchema(input: {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  publishedAt?: Date | null;
  modifiedAt?: Date | null;
  siteName?: string;
  /** Category label, e.g. "Giá vàng" */
  articleSection?: string | null;
  /** Byline — source name or site editorial desk */
  authorName?: string | null;
  authorUrl?: string | null;
}): JsonLd {
  const siteName = input.siteName || "Giá Hôm Nay";
  const published = input.publishedAt?.toISOString();
  const modified =
    input.modifiedAt?.toISOString() || published;
  const logoUrl = absoluteUrl("/api/brand/logo");

  const authorName = input.authorName?.trim() || siteName;
  const authorUrl = input.authorUrl?.trim() || undefined;
  const isOrgAuthor =
    authorName === siteName || Boolean(authorUrl);
  const author: JsonLd = {
    "@type": isOrgAuthor ? "Organization" : "Person",
    name: authorName,
  };
  if (authorUrl) author.url = authorUrl;
  else if (authorName === siteName) author.url = absoluteUrl("/");

  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.title,
    description: input.description,
    url: input.url,
    inLanguage: "vi",
    isAccessibleForFree: true,
    datePublished: published,
    dateModified: modified,
    author,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: absoluteUrl("/"),
      logo: brandLogoImageObject(logoUrl),
    },
    // Required by Google Article; always include on-site crawlable logo.
    image: buildArticleImages(input.image, logoUrl),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
  };

  if (input.articleSection?.trim()) {
    schema.articleSection = input.articleSection.trim();
  }

  return schema;
}

function brandLogoImageObject(logoUrl: string): JsonLd {
  return {
    "@type": "ImageObject",
    url: logoUrl,
    width: 1024,
    height: 410,
  };
}

/**
 * Google Article requires a crawlable `image`. Hotlinked CDNs often fail Googlebot,
 * which GSC reports as "Trường image bị thiếu". Always include our /api/brand/logo.
 */
function buildArticleImages(
  primary: string | null | undefined,
  logoUrl: string
): JsonLd[] {
  const images: JsonLd[] = [];
  const primaryAbs = toAbsoluteAssetUrl(primary);
  if (primaryAbs && normalizeAssetKey(primaryAbs) !== normalizeAssetKey(logoUrl)) {
    const dims = guessImageDimensions(primaryAbs);
    images.push({
      "@type": "ImageObject",
      url: primaryAbs,
      width: dims.width,
      height: dims.height,
    });
  }
  images.push(brandLogoImageObject(logoUrl));
  return images;
}

function normalizeAssetKey(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url.split("?")[0] || url;
  }
}

/** Parse width/height from common CDN filenames; else use Article-safe defaults. */
function guessImageDimensions(url: string): { width: number; height: number } {
  const m = url.match(/width(\d+).*?height(\d+)/i);
  if (m) {
    return { width: Number(m[1]), height: Number(m[2]) };
  }
  return { width: 1200, height: 675 };
}

/** Absolute URL for assets; do not force .html on image/API paths. */
function toAbsoluteAssetUrl(src?: string | null): string | undefined {
  const s = src?.trim();
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s)) return s;
  const path = s.startsWith("/") ? s : `/${s}`;
  return `${siteBaseUrlSync()}${path}`;
}

export function buildGoldSeoMetadata(
  _title: string,
  prices: GoldPriceItem[],
  siteName = "Giá Hôm Nay"
) {
  const sjc = prices.find((p) => p.code === "SJL1L10");
  const dateStr = todayDateVi();
  const priceText = sjc
    ? `SJC mua ${new Intl.NumberFormat("vi-VN").format(sjc.buy)}đ, bán ${new Intl.NumberFormat("vi-VN").format(sjc.sell)}đ`
    : "";
  const fullTitle = goldMoiNhatTitle();

  return {
    title: fullTitle,
    description: `Cập nhật ${GOLD_MOI_NHAT_TITLE_BASE.toLowerCase()} ${dateStr}. ${priceText}. So sánh SJC, DOJI, PNJ, vàng 9999, 24K. Biểu đồ lịch sử, cảnh báo giá.`,
    openGraph: {
      title: fullTitle,
      description: `${fullTitle} — ${priceText}. Dữ liệu realtime, biểu đồ, so sánh thương hiệu.`,
      type: "website" as const,
      locale: "vi_VN",
      siteName,
    },
  };
}
