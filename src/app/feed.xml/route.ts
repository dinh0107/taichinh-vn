import { buildNewsFeedResponse } from "@/lib/seo/news-feed";

export const revalidate = 60;

/** Site RSS Feed — latest published articles. */
export async function GET() {
  return buildNewsFeedResponse({
    channelTitle: "RSS Feed",
    channelPath: "/",
    selfPath: "/feed.xml",
  });
}
