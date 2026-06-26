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
import { absoluteUrl, formatNumber, formatUsd } from "@/lib/utils";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const prices = await getCurrentGoldPrices();
  const seo = buildGoldSeoMetadata("Giá vàng hôm nay", prices);
  return {
    title: seo.title,
    description: seo.description,
    openGraph: seo.openGraph,
    alternates: { canonical: absoluteUrl("/gia-vang") },
  };
}

export default async function GoldPage() {
  const prices = await getCurrentGoldPrices();
  const history = await getGoldHistory("SJL1L10", "30d");
  const faqs = generateGoldFaqs(prices);
  const sjc = prices.find((p) => p.code === "SJL1L10");
  const world = prices.find((p) => p.code === "XAUUSD");

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: absoluteUrl("/") },
      { name: "Giá vàng", url: absoluteUrl("/gia-vang") },
    ]),
    buildFinancialServiceSchema(
      "Giá vàng Việt Nam",
      "Dịch vụ tra cứu giá vàng SJC, DOJI, PNJ realtime"
    ),
    buildGoldPriceSchema(prices),
    buildFaqSchema(faqs),
  ];

  return (
    <>
      <JsonLdScript data={jsonLd} />

      {/* Page header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-8">
          <nav className="flex items-center gap-1 text-xs text-slate-400">
            <Link href="/" className="hover:text-amber-600">
              Trang chủ
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-600">Giá vàng</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            Giá vàng hôm nay
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            Cập nhật {new Date().toLocaleString("vi-VN")} — SJC, DOJI, PNJ, 9999,
            24K & vàng thế giới
          </p>

          {/* Highlight stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatBox
              label="Vàng SJC (bán ra)"
              value={sjc ? formatNumber(sjc.sell) + " đ" : "—"}
              sub={sjc ? `Mua ${formatNumber(sjc.buy)} đ` : ""}
            />
            <StatBox
              label="Vàng thế giới"
              value={world ? formatUsd(world.buy) : "—"}
              sub="XAU/USD per oz"
            />
            <StatBox
              label="Chênh lệch mua/bán SJC"
              value={sjc ? formatNumber(sjc.sell - sjc.buy) + " đ" : "—"}
              sub="Spread hiện tại"
            />
          </div>
        </div>
      </div>

      <div className="container-page space-y-8 py-10">
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Câu hỏi thường gặp
          </h2>
          <div className="mt-5 divide-y divide-slate-100">
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
        </section>
      </div>
    </>
  );
}

function StatBox({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50/60 to-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-slate-900">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
