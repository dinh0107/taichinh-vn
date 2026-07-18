import { buildNewsFeedResponse } from "@/lib/seo/news-feed";

export const revalidate = 60;

/** Feed News — RSS tin tức thị trường. */
export async function GET() {
  return buildNewsFeedResponse({
    channelTitle: "Feed News — Tin tức thị trường",
    channelPath: "/tin-tuc",
    selfPath: "/feed/news.xml",
    description:
      "Tin tức mới nhất về thị trường vàng, ngoại tệ, xăng dầu, lãi suất và hàng hóa.",
  });
}
