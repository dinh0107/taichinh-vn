import { SEO_GOLD_SLUGS } from "@/modules/gold/types";
import { getCurrentGoldPrices, filterGoldPrices } from "@/modules/gold/service";
import { GoldPriceTable } from "@/modules/gold/components/gold-price-table";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildFinancialServiceSchema,
  buildGoldSeoMetadata,
  generateGoldFaqs,
} from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/utils";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import type { Metadata } from "next";
import { GoldBrandCode, GoldPurity } from "@prisma/client";
import { notFound } from "next/navigation";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return SEO_GOLD_SLUGS.map((s) => ({ slug: s.slug }));
}

async function resolveSlugConfig(slug: string) {
  return SEO_GOLD_SLUGS.find((s) => s.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = await resolveSlugConfig(slug);
  if (!config) return { title: "Không tìm thấy" };

  const prices = await getCurrentGoldPrices();
  const seo = buildGoldSeoMetadata(config.title, prices);
  return {
    title: seo.title,
    description: seo.description,
    openGraph: seo.openGraph,
    alternates: { canonical: absoluteUrl(`/${slug}`) },
  };
}

export default async function GoldSeoPage({ params }: Props) {
  const { slug } = await params;
  const config = await resolveSlugConfig(slug);
  if (!config) notFound();

  const allPrices = await getCurrentGoldPrices();
  const prices = filterGoldPrices(allPrices, {
    brand: "brand" in config ? (config.brand as GoldBrandCode) : undefined,
    purity: "purity" in config ? (config.purity as GoldPurity) : undefined,
  });

  const displayPrices = prices.length > 0 ? prices : allPrices;
  const faqs = generateGoldFaqs(displayPrices);

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: absoluteUrl("/") },
      { name: "Giá vàng", url: absoluteUrl("/gia-vang") },
      { name: config.title, url: absoluteUrl(`/${slug}`) },
    ]),
    buildFinancialServiceSchema(config.title, `Tra cứu ${config.title.toLowerCase()} mới nhất`),
    buildFaqSchema(faqs),
  ];

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{config.title}</h1>
          <p className="mt-2 text-slate-600">
            Cập nhật lúc {new Date().toLocaleString("vi-VN")} — Dữ liệu từ nguồn uy tín
          </p>
        </div>

        <GoldPriceTable prices={displayPrices} />

        <section className="rounded-xl border border-slate-200 bg-white p-6 prose prose-slate max-w-none">
          <h2>{config.title} — Phân tích nhanh</h2>
          <p>
            Trang này cung cấp thông tin {config.title.toLowerCase()} được cập nhật liên tục.
            TaiChinh.vn tổng hợp dữ liệu từ các thương hiệu vàng uy tín tại Việt Nam,
            giúp nhà đầu tư so sánh giá mua/bán trước khi quyết định.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">FAQ — {config.title}</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group border-b border-slate-100 pb-4">
                <summary className="cursor-pointer font-medium">{faq.question}</summary>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
