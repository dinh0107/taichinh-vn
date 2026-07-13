import Link from "next/link";
import type { Metadata } from "next";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { PageBottomArticle } from "@/components/seo/page-bottom-article";
import { buildPageMetadata, MODULE_FAQS } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { getCurrentGoldPrices } from "@/modules/gold/service";
import { getForexRatesByBank } from "@/modules/forex/service";
import { GoldPriceCards } from "@/modules/gold/components/gold-price-table";
import { MetricCard, SectionHeading } from "@/components/ui/market-ui";
import { formatNumber, formatUsd } from "@/lib/utils";
import { withHtmlExtension } from "@/lib/seo/html-path";
import {
  Coins,
  DollarSign,
  Landmark,
  TrendingUp,
  Fuel,
  Newspaper,
  ArrowRight,
  Activity,
} from "lucide-react";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const name = s.site_name || "TaiChinh.vn";
  const description =
    s.site_description ||
    "Tra cứu giá vàng SJC, tỷ giá USD, lãi suất ngân hàng, chứng khoán VNINDEX và giá xăng dầu — cập nhật liên tục, miễn phí.";

  return buildPageMetadata({
    title: `${name} — Giá vàng, Tỷ giá, Lãi suất, Chứng khoán`,
    description,
    path: "/",
  });
}

const MODULES = [
  { href: withHtmlExtension("/gia-vang"), icon: Coins, title: "Giá vàng", desc: "SJC · DOJI · PNJ · 9999" },
  { href: withHtmlExtension("/ty-gia"), icon: DollarSign, title: "Tỷ giá", desc: "USD · EUR · JPY" },
  { href: withHtmlExtension("/lai-suat"), icon: Landmark, title: "Lãi suất", desc: "7 ngân hàng lớn" },
  { href: withHtmlExtension("/chung-khoan"), icon: TrendingUp, title: "Chứng khoán", desc: "VNINDEX · HNX · UPCOM" },
  { href: withHtmlExtension("/gia-xang"), icon: Fuel, title: "Giá xăng", desc: "RON95 · E5 · Diesel" },
  { href: withHtmlExtension("/tin-tuc"), icon: Newspaper, title: "Tin tức", desc: "Phân tích thị trường" },
];

export default async function HomePage() {
  const [goldPrices, forexRates, settings] = await Promise.all([
    getCurrentGoldPrices(),
    getForexRatesByBank(),
    getSiteSettings(),
  ]);
  const siteName = settings.site_name || "TaiChinh.vn";
  const siteDesc =
    settings.site_description ||
    "Tra cứu giá vàng SJC, tỷ giá USD, lãi suất ngân hàng, chứng khoán VNINDEX và giá xăng dầu — cập nhật liên tục, miễn phí.";
  const sjc = goldPrices.find((p) => p.code === "SJL1L10");
  const world = goldPrices.find((p) => p.code === "XAUUSD");
  const usdRate = forexRates[0]?.rates?.USD;

  return (
    <div>
      <ModuleJsonLd
        path="/"
        serviceName={siteName}
        serviceDescription={siteDesc}
        breadcrumbLabel="Trang chủ"
        faqs={[...MODULE_FAQS.home]}
      />
      <section className="relative overflow-hidden bg-finance-hero bg-finance-grid text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-finance-ink/20 via-transparent to-finance-ink" />
        <div className="container-page relative py-10 md:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl animate-fade-up">
              <div className="inline-flex items-center gap-2 border border-gold-500/30 bg-gold-500/10 px-3 py-1">
                <Activity className="h-3.5 w-3.5 text-gold-400" />
                <span className="label-caps text-gold-400">
                  Market Intelligence
                </span>
              </div>
              <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                Theo dõi biến động{" "}
                <span className="text-gold-400">tài chính</span> Việt Nam
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-finance-400 md:text-base">
                Nền tảng tra cứu giá vàng, tỷ giá, lãi suất và chứng khoán —
                dữ liệu cập nhật liên tục, giao diện chuyên nghiệp.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href={withHtmlExtension("/gia-vang")}
                  className="inline-flex items-center gap-2 border border-gold-500/50 bg-gold-500/15 px-4 py-2 text-xs font-semibold tracking-wide text-gold-300 transition hover:bg-gold-500/25"
                >
                  GIÁ VÀNG <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={withHtmlExtension("/ty-gia")}
                  className="inline-flex items-center border border-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-finance-300 transition hover:border-white/20 hover:text-white"
                >
                  TỶ GIÁ
                </Link>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-2xl">
              <MetricCard
                dark
                label="Vàng SJC"
                value={sjc ? formatNumber(sjc.sell) + " đ" : "—"}
                sub="Giá bán ra"
                change={sjc?.changeSell}
                changeFormat="vnd"
                accent="amber"
              />
              <MetricCard
                dark
                label="XAU/USD"
                value={world ? formatUsd(world.buy) : "—"}
                sub="Vàng thế giới"
                change={world?.changeBuy}
                changeFormat="usd"
                accent="sky"
              />
              <MetricCard
                dark
                label="USD/VND"
                value={usdRate ? formatNumber(usdRate.sell) + " đ" : "—"}
                sub="Tỷ giá bán"
                change={usdRate?.ch}
                changeFormat="raw"
                accent="emerald"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-page space-y-10 py-10 md:py-12">
        <section className="space-y-4">
          <SectionHeading
            title="Giá vàng hôm nay"
            description={`Cập nhật ${new Date().toLocaleString("vi-VN")}`}
            href={withHtmlExtension("/gia-vang")}
            icon={Coins}
          />
          <GoldPriceCards prices={goldPrices} />
        </section>

        <section className="space-y-4">
          <SectionHeading
            title="Thị trường"
            description="Các chỉ số và dữ liệu tài chính"
          />
          <div className="grid gap-px overflow-hidden rounded border border-finance-200 bg-finance-200 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod) => (
              <Link key={mod.href} href={mod.href}>
                <div className="card-hover group flex h-full items-center gap-4 bg-white p-5 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-finance-200 bg-finance-50 text-finance-600 transition-colors group-hover:border-gold-500/40 group-hover:text-gold-600">
                    <mod.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-finance-900 group-hover:text-gold-700">
                      {mod.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-finance-500">{mod.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-finance-300 transition-all group-hover:translate-x-0.5 group-hover:text-gold-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded border border-finance-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-sm font-semibold text-finance-900">Tra cứu nhanh</h2>
          <p className="mt-0.5 text-xs text-finance-500">Trang phổ biến</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {[
              ["Giá vàng hôm nay", "gia-vang-hom-nay"],
              ["Giá vàng SJC", "gia-vang-sjc-hom-nay"],
              ["Tỷ giá USD", "ty-gia-usd-hom-nay"],
              ["Lãi suất VCB", "lai-suat-vietcombank"],
            ].map(([label, slug]) => (
              <Link
                key={slug}
                href={withHtmlExtension(`/${slug}`)}
                className="rounded border border-finance-200 bg-finance-50 px-3 py-1.5 text-xs font-medium text-finance-600 transition-colors hover:border-gold-500/40 hover:text-gold-700"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        <PageBottomArticle slug="home" />
      </div>
    </div>
  );
}
