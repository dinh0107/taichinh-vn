import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { SETTING_DEFAULTS } from "@/modules/admin/settings-shared";
import { getPublishedArticles } from "@/modules/news/service";
import { buildRss2, plainTextSnippet } from "@/lib/seo/rss";
import { getSiteBaseUrl, canonicalUrl } from "@/lib/seo/site-url";

/** Shared RSS response for /feed.xml and /feed/news.xml. */
export async function buildNewsFeedResponse(opts: {
  channelTitle: string;
  channelPath: string;
  selfPath: string;
  description?: string;
}): Promise<Response> {
  const [articles, settings, base] = await Promise.all([
    getPublishedArticles(50),
    getSiteSettings().catch(() => SETTING_DEFAULTS),
    getSiteBaseUrl(),
  ]);

  const siteName = settings.site_name || SETTING_DEFAULTS.site_name;
  const siteDesc =
    settings.site_description || SETTING_DEFAULTS.site_description;
  const channelLink = await canonicalUrl(opts.channelPath);
  const selfUrl = `${base}${opts.selfPath}`;

  const items = await Promise.all(
    articles.map(async (a) => {
      const link = await canonicalUrl(`/tin-tuc/${a.slug}`);
      return {
        title: a.title,
        link,
        guid: link,
        description: plainTextSnippet(a.excerpt || a.title, 320),
        pubDate: a.publishedAt,
        category: NEWS_CATEGORY_LABELS[a.category] ?? a.category,
      };
    })
  );

  const title = opts.channelTitle.includes(siteName)
    ? opts.channelTitle
    : `${opts.channelTitle} — ${siteName}`;

  const xml = buildRss2({
    title,
    link: channelLink,
    description: opts.description || siteDesc,
    selfUrl,
    items,
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
