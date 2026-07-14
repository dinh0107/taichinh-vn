import type { MetadataRoute } from "next";
import { getPublishedArticleSlugs } from "@/modules/news/service";
import { getSiteBaseUrl } from "@/lib/seo/site-url";
import { getIndexedSeoPaths } from "@/modules/admin/seo-service";
import { withHtmlExtension } from "@/lib/seo/html-path";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = await getSiteBaseUrl();

  const staticPages = [
    "",
    "/gia-vang",
    "/ty-gia",
    "/lai-suat",
    "/chung-khoan",
    "/gia-xang",
    "/tin-tuc",
  ];

  const seoPaths = await getIndexedSeoPaths();

  const articleSlugs = await getPublishedArticleSlugs();
  const articlePages = articleSlugs.map((slug) => `/tin-tuc/${slug}`);

  const combined = [
    ...staticPages,
    ...seoPaths.map((p) => (p.startsWith("/") ? p : `/${p}`)),
    ...articlePages,
  ];

  const unique = [...new Set(combined)];

  return unique.map((path) => {
    const publicPath =
      path === "" || path === "/" ? "/" : withHtmlExtension(path);
    const url = publicPath === "/" ? `${BASE}/` : `${BASE}${publicPath}`;
    return {
      url,
      lastModified: new Date(),
      changeFrequency: path.includes("hom-nay")
        ? ("hourly" as const)
        : ("daily" as const),
      priority:
        path === ""
          ? 1
          : path.includes("gia-vang") || path.includes("hom-nay")
            ? 0.9
            : 0.7,
    };
  });
}
