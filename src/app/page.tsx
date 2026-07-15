import type { Metadata } from "next";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { PageBottomArticle } from "@/components/seo/page-bottom-article";
import { HomeHero } from "@/components/home/home-hero";
import { HomeGoldTable } from "@/components/home/home-gold-table";
import { HomeFuelSection } from "@/components/home/home-fuel-section";
import { HomeInterestSection } from "@/components/home/home-interest-section";
import { HomeNewsSection } from "@/components/home/home-news-section";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { HomeLeftNav } from "@/components/home/home-left-nav";
import { HomeMarketTabs } from "@/components/home/home-market-tabs";
import { buildPageMetadata, MODULE_FAQS } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { getCurrentGoldPrices, getHomeGoldBoard } from "@/modules/gold/service";
import { getForexRatesByBank } from "@/modules/forex/service";
import { getFuelPrices } from "@/modules/fuel/service";
import { getInterestRatesByBank } from "@/modules/interest/service";
import { getPublishedArticles } from "@/modules/news/service";

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
    todayPrefix: false,
  });
}

export default async function HomePage() {
  const [goldBoard, forexRates, fuels, banks, articles, settings] =
    await Promise.all([
      getHomeGoldBoard(),
      getForexRatesByBank(),
      getFuelPrices(),
      getInterestRatesByBank(),
      getPublishedArticles(6),
      getSiteSettings(),
    ]);

  void getCurrentGoldPrices();

  const siteName = settings.site_name || "TaiChinh.vn";
  const siteDesc =
    settings.site_description ||
    "Theo dõi giá vàng SJC, vàng 9999, DOJI, PNJ, tỷ giá ngoại tệ, giá xăng dầu và lãi suất ngân hàng được cập nhật liên tục nhanh và chính xác.";

  const vcb = forexRates.find((b) =>
    b.bankName.toLowerCase().includes("vietcombank")
  );
  const forex = vcb?.rates ?? forexRates[0]?.rates;

  return (
    <div className="pb-8 pt-5 md:pt-6">
      <ModuleJsonLd
        path="/"
        serviceName={siteName}
        serviceDescription={siteDesc}
        breadcrumbLabel="Trang chủ"
        faqs={[...MODULE_FAQS.home]}
      />

      <div className="container-page">
        <HomeMarketTabs />

        <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)_340px] 2xl:grid-cols-[248px_minmax(0,1fr)_360px]">
          <HomeLeftNav />

          <div className="min-w-0 space-y-5">
            <HomeHero description={siteDesc} />
            <HomeGoldTable prices={goldBoard} />
            <HomeFuelSection fuels={fuels} />
            <HomeInterestSection banks={banks} />
            <HomeNewsSection articles={articles} />
            <PageBottomArticle slug="home" />
          </div>

          <div className="min-w-0">
            <HomeSidebar forex={forex} fuels={fuels} />
          </div>
        </div>
      </div>
    </div>
  );
}
