import { absoluteUrl } from "@/lib/utils";
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
  siteName = "TaiChinh.vn"
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name,
    description,
    url: absoluteUrl("/"),
    areaServed: {
      "@type": "Country",
      name: "Vietnam",
    },
    provider: {
      "@type": "Organization",
      name: siteName,
      url: absoluteUrl("/"),
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
        "Tùy thuộc vào mục đích đầu tư và vị trí địa lý. SJC là thương hiệu quốc gia, thanh khoản cao. DOJI có mạng lưới rộng. So sánh giá mua/bán tại TaiChinh.vn trước khi quyết định.",
    },
    {
      question: "Giá vàng cập nhật bao lâu một lần?",
      answer:
        "Giá vàng trên TaiChinh.vn được cập nhật mỗi 5 phút từ các nguồn dữ liệu uy tín.",
    },
  ];
}

export function buildNewsArticleSchema(input: {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  publishedAt?: Date | null;
  siteName?: string;
}): JsonLd {
  const siteName = input.siteName || "TaiChinh.vn";
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.title,
    description: input.description,
    url: input.url,
    datePublished: input.publishedAt?.toISOString(),
    dateModified: input.publishedAt?.toISOString(),
    image: input.image ? [input.image] : undefined,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
  };
}

export function buildGoldSeoMetadata(
  title: string,
  prices: GoldPriceItem[],
  siteName = "TaiChinh.vn"
) {
  const sjc = prices.find((p) => p.code === "SJL1L10");
  const dateStr = new Date().toLocaleDateString("vi-VN");
  const priceText = sjc
    ? `SJC mua ${new Intl.NumberFormat("vi-VN").format(sjc.buy)}đ, bán ${new Intl.NumberFormat("vi-VN").format(sjc.sell)}đ`
    : "";
  const fullTitle = `${title} — Cập nhật ${dateStr} | ${siteName}`;

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
