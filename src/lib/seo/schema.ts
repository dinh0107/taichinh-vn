import { absoluteUrl } from "@/lib/utils";
import { siteBaseUrlSync } from "@/lib/seo/site-url";
import { todayDateVi, withHomNayTitlePrefix } from "@/lib/time";
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

export function buildFinancialServiceSchema(
  name: string,
  description: string,
  siteName = "Giá Hôm Nay",
  opts?: { image?: string; telephone?: string }
): JsonLd {
  const image = opts?.image?.trim() || absoluteUrl("/api/brand/logo");
  const telephone = opts?.telephone?.trim() || undefined;
  const org: JsonLd = {
    "@type": "Organization",
    name: siteName,
    url: absoluteUrl("/"),
    logo: image,
    image,
  };
  if (telephone) org.telephone = telephone;

  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name,
    description,
    url: absoluteUrl("/"),
    image,
    logo: image,
    // Tra cứu giá miễn phí — không bán hàng tại cửa hàng
    priceRange: "Miễn phí",
    address: {
      "@type": "PostalAddress",
      addressCountry: "VN",
      addressLocality: "Toàn quốc",
      addressRegion: "Việt Nam",
    },
    areaServed: {
      "@type": "Country",
      name: "Vietnam",
    },
    provider: org,
  };
  if (telephone) schema.telephone = telephone;
  return schema;
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

export function buildGoldPriceSchema(prices: GoldPriceItem[]): JsonLd {
  const sjc = prices.find((p) => p.code === "SJL1L10");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Vàng SJC 9999",
    description: "Giá vàng SJC 9999 mới nhất tại Việt Nam",
    offers: sjc
      ? {
          "@type": "Offer",
          price: sjc.sell,
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          priceValidUntil: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        }
      : undefined,
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
  const imageUrl = toAbsoluteAssetUrl(input.image);
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
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
        width: 1024,
        height: 410,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
  };

  if (imageUrl) {
    schema.image = [
      {
        "@type": "ImageObject",
        url: imageUrl,
      },
    ];
  } else {
    // Google Article requires image — fall back to site logo
    schema.image = [
      {
        "@type": "ImageObject",
        url: logoUrl,
        width: 1024,
        height: 410,
      },
    ];
  }

  if (input.articleSection?.trim()) {
    schema.articleSection = input.articleSection.trim();
  }

  return schema;
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
  title: string,
  prices: GoldPriceItem[],
  siteName = "Giá Hôm Nay"
) {
  const sjc = prices.find((p) => p.code === "SJL1L10");
  const dateStr = todayDateVi();
  const priceText = sjc
    ? `SJC mua ${new Intl.NumberFormat("vi-VN").format(sjc.buy)}đ, bán ${new Intl.NumberFormat("vi-VN").format(sjc.sell)}đ`
    : "";
  const dated = withHomNayTitlePrefix(title, undefined, siteName);
  const fullTitle = dated;

  return {
    title: fullTitle,
    description: `Cập nhật ${title.toLowerCase()} mới nhất ${dateStr}. ${priceText}. So sánh SJC, DOJI, PNJ, vàng 9999, 24K. Biểu đồ lịch sử, cảnh báo giá.`,
    openGraph: {
      title: fullTitle,
      description: `${title} — ${priceText}. Dữ liệu realtime, biểu đồ, so sánh thương hiệu.`,
      type: "website" as const,
      locale: "vi_VN",
      siteName,
    },
  };
}
