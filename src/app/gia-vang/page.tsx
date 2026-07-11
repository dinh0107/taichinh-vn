import type { Metadata } from "next";
import {
  getCurrentGoldPrices,
  getGoldHistory,
} from "@/modules/gold/service";
import { GoldPriceTable } from "@/modules/gold/components/gold-price-table";
import { GoldChartSection } from "@/modules/gold/components/gold-chart-section";
import { GoldComparePanel } from "@/modules/gold/components/gold-compare-panel";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildFinancialServiceSchema,
  buildGoldPriceSchema,
  buildGoldSeoMetadata,
  generateGoldFaqs,
} from "@/lib/seo/schema";
import { canonicalUrl } from "@/lib/seo/site-url";
import { formatNumber, formatUsd } from "@/lib/utils";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { MetricCard, PageMain, ProseSection } from "@/components/ui/market-ui";
import { PageHeader } from "@/components/layout/page-header";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { ChevronRight, Coins } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [prices, s] = await Promise.all([
    getCurrentGoldPrices(),
    getSiteSettings(),
  ]);
  const siteName = s.site_name || "TaiChinh.vn";
  const v = s.brand_asset_version || "0";
  const icon = `/logo-icon.png?v=${v}`;
  const seo = buildGoldSeoMetadata("Giá vàng hôm nay", prices, siteName);
  return {
    title: { absolute: seo.title },
    description: seo.description,
    openGraph: {
      ...seo.openGraph,
      images: [{ url: `/brand-wordmark.png?v=${v}`, alt: siteName }],
    },
    alternates: { canonical: await canonicalUrl("/gia-vang") },
    icons: {
      icon: [{ url: icon, type: "image/png" }],
      apple: [{ url: icon, type: "image/png" }],
    },
  };
}

export default async function GoldPage() {
  const [prices, history, settings] = await Promise.all([
    getCurrentGoldPrices(),
    getGoldHistory("SJL1L10", "30d"),
    getSiteSettings(),
  ]);
  const faqs = generateGoldFaqs(prices);
  const sjc = prices.find((p) => p.code === "SJL1L10");
  const world = prices.find((p) => p.code === "XAUUSD");
  const homeUrl = await canonicalUrl("/");
  const pageUrl = await canonicalUrl("/gia-vang");
  const siteName = settings.site_name || "TaiChinh.vn";

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: homeUrl },
      { name: "Giá vàng", url: pageUrl },
    ]),
    buildFinancialServiceSchema(
      "Giá vàng Việt Nam",
      "Dịch vụ tra cứu giá vàng SJC, DOJI, PNJ realtime",
      siteName
    ),
    buildGoldPriceSchema(prices),
    buildFaqSchema(faqs),
  ];

  return (
    <>
      <JsonLdScript data={jsonLd} />

      <PageHeader
        title="Giá vàng hôm nay"
        description="Cập nhật SJC, DOJI, PNJ, 9999, 24K và vàng thế giới."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Giá vàng" }]}
        icon={Coins}
        badge={`Cập nhật ${new Date().toLocaleString("vi-VN")}`}
      />

      <PageMain>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Vàng SJC (bán ra)"
            value={sjc ? `${formatNumber(sjc.sell)} đ` : "—"}
            sub={sjc ? `Mua ${formatNumber(sjc.buy)} đ` : undefined}
            accent="amber"
          />
          <MetricCard
            label="Vàng thế giới"
            value={world ? formatUsd(world.buy) : "—"}
            sub="XAU/USD per oz"
            accent="sky"
          />
          <MetricCard
            label="Chênh lệch mua/bán SJC"
            value={sjc ? `${formatNumber(sjc.sell - sjc.buy)} đ` : "—"}
            sub="Spread hiện tại"
            accent="emerald"
          />
        </div>

        <GoldPriceTable prices={prices} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Biểu đồ giá vàng SJC 9999
            </h2>
            <GoldChartSection
              code="SJL1L10"
              initialData={history.map((h) => ({
                buy: h.buy,
                sell: h.sell,
                recordedAt: h.recordedAt.toISOString(),
              }))}
            />
          </div>
          <GoldComparePanel prices={prices} />
        </div>

        <ProseSection title="Câu hỏi thường gặp">
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, i) => (
              <details key={i} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-800 marker:content-none group-open:text-amber-700">
                  {faq.question}
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </ProseSection>
      </PageMain>
    </>
  );
}
