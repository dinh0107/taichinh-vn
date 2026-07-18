import type { Metadata } from "next";
import Link from "next/link";
import {
  getCurrentGoldPrices,
  getGoldHistory,
  getHomeGoldBoard,
} from "@/modules/gold/service";
import { GoldChartSection } from "@/modules/gold/components/gold-chart-section";
import { GoldComparePanel } from "@/modules/gold/components/gold-compare-panel";
import { HomeGoldTable } from "@/components/home/home-gold-table";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildFinancialServiceSchema,
  buildGoldPriceSchema,
  buildGoldSeoMetadata,
  buildWebPageSchema,
  generateGoldFaqs,
} from "@/lib/seo/schema";
import { canonicalUrl } from "@/lib/seo/site-url";
import { formatNumber, formatUsd, cn, absoluteUrl } from "@/lib/utils";
import { formatDateTimeVi, goldMoiNhatTitle, GOLD_MOI_NHAT_TITLE_BASE } from "@/lib/time";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { PageBottomArticle } from "@/components/seo/page-bottom-article";
import { PageHeader, ModuleSection } from "@/components/layout/page-header";
import { MarketPageShell } from "@/components/layout/market-page-shell";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { getPublishedArticles } from "@/modules/news/service";
import { goldDetailHref } from "@/lib/seo/detail-links";
import { ChevronRight } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [prices, s] = await Promise.all([
    getCurrentGoldPrices(),
    getSiteSettings(),
  ]);
  const siteName = s.site_name || "Giá Hôm Nay";
  const v = s.brand_asset_version || "0";
  const seo = buildGoldSeoMetadata(GOLD_MOI_NHAT_TITLE_BASE, prices, siteName);
  const url = await canonicalUrl("/gia-vang");
  const image = `/api/brand/logo?v=${v}`;
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      ...seo.openGraph,
      url,
      images: [{ url: image, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [image],
    },
  };
}

export default async function GoldPage() {
  const [prices, board, history, settings, articles] = await Promise.all([
    getCurrentGoldPrices(),
    getHomeGoldBoard(),
    getGoldHistory("SJL1L10", "30d"),
    getSiteSettings(),
    getPublishedArticles(5),
  ]);
  const faqs = generateGoldFaqs(prices);
  const world = prices.find((p) => p.code === "XAUUSD");
  const domestic = prices.filter((p) => p.currency !== "USD").slice(0, 6);
  const homeUrl = await canonicalUrl("/");
  const pageUrl = await canonicalUrl("/gia-vang");
  const siteName = settings.site_name || "Giá Hôm Nay";
  const v = settings.brand_asset_version || "0";
  const brandImage = absoluteUrl(`/api/brand/logo?v=${v}`);

  const goldDesc =
    "Dịch vụ tra cứu giá vàng SJC, DOJI, PNJ realtime";
  const goldTitle = goldMoiNhatTitle();
  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: homeUrl },
      { name: "Giá vàng", url: pageUrl },
    ]),
    buildWebPageSchema({
      name: goldTitle,
      description: goldDesc,
      url: pageUrl,
      siteName,
    }),
    buildArticleSchema({
      title: goldTitle,
      description: goldDesc,
      url: pageUrl,
      image: brandImage,
      siteName,
      articleSection: "Giá vàng",
    }),
    buildFinancialServiceSchema("Giá vàng Việt Nam", goldDesc, siteName, {
      image: brandImage,
      telephone: settings.site_phone?.trim() || undefined,
      url: pageUrl,
    }),
    buildGoldPriceSchema(prices),
    buildFaqSchema(faqs),
  ];

  const detailLinks = [
    { label: "SJC hôm nay mới nhất", href: "/gia-vang-sjc-hom-nay", featured: true },
    { label: "SJC mới nhất", href: "/gia-vang-sjc-moi-nhat", featured: true },
    { label: "DOJI hôm nay mới nhất", href: "/gia-vang-doji-hom-nay" },
    { label: "DOJI mới nhất", href: "/gia-vang-doji-moi-nhat" },
    { label: "PNJ hôm nay mới nhất", href: "/gia-vang-pnj-hom-nay" },
    { label: "PNJ mới nhất", href: "/gia-vang-pnj-moi-nhat" },
    { label: "Bảo Tín", href: "/gia-vang-bao-tin-hom-nay" },
    { label: "Thế giới", href: "/gia-vang-the-gioi-hom-nay", featured: true },
  ];

  return (
    <MarketPageShell>
      <JsonLdScript data={jsonLd} />

      <PageHeader
        title={goldTitle}
        description="Cập nhật giá vàng hôm nay mới nhất trong nước và quốc tế theo thời gian thực, bao gồm giá vàng SJC, DOJI, PNJ, vàng 9999 và giá vàng thế giới. Dữ liệu được tổng hợp liên tục từ các nguồn uy tín, kèm biểu đồ giá vàng và lịch sử biến động."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Giá vàng" }]}
        categoryLabel="Giá vàng"
        badge={`Cập nhật ${formatDateTimeVi(new Date())}`}
      />

      <ModuleSection
        title="Giá vàng trong nước"
        description="Biến động so với kỳ trước"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {domestic.map((p) => (
            <Link
              key={p.code}
              href={goldDetailHref(p) ?? "/gia-vang-hom-nay"}
              className="group rounded-xl border border-[var(--border-soft)] bg-white p-4 transition hover:border-blue-600/25 hover:bg-blue-50/40"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Vàng trong nước
              </p>
              <h3 className="mt-1 text-base font-bold text-[var(--text-primary)] group-hover:text-blue-700">
                {p.nameVi}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] text-[var(--text-muted)]">Mua vào</p>
                  <p className="data-value mt-0.5 font-bold text-[var(--accent-red)]">
                    {formatNumber(p.buy)}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">VND/Chỉ</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--text-muted)]">Bán ra</p>
                  <p className="data-value mt-0.5 font-bold text-emerald-600">
                    {formatNumber(p.sell)}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">VND/Chỉ</p>
                </div>
              </div>
              <p className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600">
                Xem chi tiết
                <ChevronRight className="h-3.5 w-3.5" />
              </p>
            </Link>
          ))}
        </div>
      </ModuleSection>

      {world && (
        <ModuleSection
          title="Giá vàng thế giới"
          description="Biến động so với kỳ trước"
          href="/gia-vang-the-gioi-hom-nay"
          linkLabel="Xem chi tiết"
        >
          <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] text-[var(--text-muted)]">Giá</p>
                <p className="data-value mt-1 text-2xl font-extrabold text-[var(--text-primary)]">
                  {formatUsd(world.buy)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-muted)]">Biến động</p>
                <p
                  className={cn(
                    "data-value mt-1 text-2xl font-extrabold",
                    world.changeBuy >= 0 ? "text-emerald-600" : "text-[var(--accent-red)]"
                  )}
                >
                  {world.changeBuy >= 0 ? "+" : ""}
                  {world.changeBuy.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </ModuleSection>
      )}

      <HomeGoldTable prices={board.length > 0 ? board : prices.filter((p) => p.currency !== "USD")} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface-card p-5 md:p-6 lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-[var(--text-primary)]">
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

      <ModuleSection
        title="Tin tức giá vàng"
        description="Cập nhật tin nhanh và phân tích mới nhất về giá vàng."
        href="/tin-tuc"
        linkLabel="Xem tất cả tin"
      >
        {articles.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            Chưa có bài viết nào trong chuyên mục này.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {articles.map((a, i) => (
              <li key={a.slug}>
                <Link
                  href={`/tin-tuc/${a.slug}`}
                  className="group flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-blue-700">
                    {a.title}
                  </span>
                  {i === 0 && (
                    <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                      Nổi bật
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </ModuleSection>

      <ModuleSection
        title="Liên kết chi tiết"
        description="Đi tới các trang chi tiết theo thương hiệu, chủ đề và bộ lọc liên quan"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-bold text-[var(--text-primary)]">
              Giá vàng trong nước
            </h3>
            <ul className="space-y-1.5">
              {detailLinks
                .filter((l) => !l.href.includes("the-gioi"))
                .map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-slate-100/70"
                    >
                      {l.label}
                      {l.featured && (
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                          Nổi bật
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold text-[var(--text-primary)]">
              Giá vàng quốc tế
            </h3>
            <ul className="space-y-1.5">
              {detailLinks
                .filter((l) => l.href.includes("the-gioi"))
                .map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-slate-100/70"
                    >
                      {l.label}
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                        Nổi bật
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </ModuleSection>

      <ModuleSection title="Câu hỏi thường gặp">
        <div className="divide-y divide-slate-100">
          {faqs.map((faq, i) => (
            <details key={i} className="group py-3">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-[var(--text-primary)] marker:content-none">
                {faq.question}
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </ModuleSection>

      <PageBottomArticle slug="gia-vang" />
    </MarketPageShell>
  );
}
