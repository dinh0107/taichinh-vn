import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/seo/site-url";

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getSiteBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        // Allow brand assets used as OG/favicon (Google: longest path wins)
        allow: ["/", "/favicon.ico", "/api/brand/"],
        disallow: ["/admin", "/api/", "/dang-nhap"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
