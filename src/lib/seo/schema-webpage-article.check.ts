/**
 * ponytail: WebPage + Article builders must emit required Google fields.
 * Run: npx tsx src/lib/seo/schema-webpage-article.check.ts
 */
import assert from "node:assert/strict";
import { buildArticleSchema, buildWebPageSchema } from "./schema";

const page = buildWebPageSchema({
  name: "Giá vàng SJC mới nhất",
  description: "Cập nhật giá SJC",
  url: "https://giahomnay.site/gia-vang-sjc-moi-nhat",
  siteName: "Giá Hôm Nay",
  dateModified: "2026-07-18",
});
assert.equal(page["@type"], "WebPage");
assert.equal(page.inLanguage, "vi");
assert.equal((page.isPartOf as { "@type": string })["@type"], "WebSite");
assert.ok(page.dateModified);

const article = buildArticleSchema({
  title: "Giá vàng SJC mới nhất",
  description: "Cập nhật giá SJC",
  url: "https://giahomnay.site/gia-vang-sjc-moi-nhat",
  siteName: "Giá Hôm Nay",
  authorName: "Ban biên tập",
  articleSection: "Giá vàng",
  publishedAt: "2026-07-18",
});
assert.equal(article["@type"], "Article");
assert.ok(Array.isArray(article.image));
assert.equal(article.articleSection, "Giá vàng");
assert.equal((article.author as { name: string }).name, "Ban biên tập");
assert.equal(
  (article.mainEntityOfPage as { "@type": string })["@type"],
  "WebPage"
);

console.log("schema-webpage-article.check ok");
