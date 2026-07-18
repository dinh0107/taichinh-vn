/**
 * ponytail: NewsArticle schema must include Google-required author + image.
 * Run: npx tsx src/lib/seo/schema-article.check.ts
 */
import assert from "node:assert/strict";
import { buildNewsArticleSchema } from "./schema";

const schema = buildNewsArticleSchema({
  title: "Giá vàng hôm nay",
  description: "Mô tả bài viết",
  url: "https://giahomnay.site/tin-tuc/gia-vang-hom-nay.html",
  image: "https://example.com/cover.jpg",
  publishedAt: new Date("2026-07-17T01:00:00.000Z"),
  modifiedAt: new Date("2026-07-17T02:00:00.000Z"),
  siteName: "Giá Hôm Nay",
  articleSection: "Giá vàng",
  authorName: "24h",
  authorUrl: "https://www.24h.com.vn",
});

assert.equal(schema["@type"], "NewsArticle");
assert.ok(schema.author);
assert.equal((schema.author as { name: string }).name, "24h");
assert.equal((schema.author as { "@type": string })["@type"], "Organization");
assert.ok(Array.isArray(schema.image));
const images = schema.image as { url: string; width?: number; height?: number }[];
assert.equal(images[0].url, "https://example.com/cover.jpg");
assert.ok(images[0].width && images[0].height);
assert.ok(images.some((i) => /\/api\/brand\/logo/.test(i.url)), "on-site logo fallback");
assert.equal(schema.articleSection, "Giá vàng");
assert.equal(schema.inLanguage, "vi");
assert.equal(
  ((schema.publisher as { logo: { "@type": string } }).logo)["@type"],
  "ImageObject"
);

const noImage = buildNewsArticleSchema({
  title: "No cover",
  description: "x",
  url: "https://giahomnay.site/tin-tuc/x.html",
  siteName: "Giá Hôm Nay",
});
assert.ok(Array.isArray(noImage.image));
assert.equal((noImage.image as unknown[]).length, 1);
assert.match(
  (noImage.image as { url: string }[])[0].url,
  /\/api\/brand\/logo/
);
assert.equal((noImage.image as { width: number }[])[0].width, 1024);

console.log("schema-article.check ok");
