import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InfoPageView } from "@/components/site/info-page-view";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/utils";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { getInfoPage, type InfoPageDef } from "@/modules/site/info-pages";

export const revalidate = 3600;

export async function buildInfoMetadata(slug: string): Promise<Metadata> {
  const page = getInfoPage(slug);
  if (!page) return { title: "Không tìm thấy" };
  return buildPageMetadata({
    title: page.title,
    description: page.description,
    path: `/${slug}`,
    todayPrefix: false,
  });
}

export async function renderInfoPage(slug: string) {
  const page = getInfoPage(slug);
  if (!page) notFound();
  return InfoPageInner(page);
}

async function InfoPageInner(page: InfoPageDef) {
  const s = await getSiteSettings();
  const siteName = s.site_name || "Giá Hôm Nay";
  const v = s.brand_asset_version || "0";
  return (
    <InfoPageView
      page={page}
      siteName={siteName}
      sitePhone={s.site_phone?.trim() || undefined}
      brandImage={absoluteUrl(`/api/brand/logo?v=${v}`)}
    />
  );
}
