/**
 * ponytail: RSS escape / build must not leak raw XML specials.
 * Run: npx tsx src/lib/seo/rss.check.ts
 */
import assert from "node:assert/strict";
import { buildRss2, escapeXml, plainTextSnippet } from "./rss";

assert.equal(escapeXml(`A & B <c> "d" 'e'`), "A &amp; B &lt;c&gt; &quot;d&quot; &apos;e&apos;");
assert.equal(plainTextSnippet("<p>Hello <b>world</b></p>"), "Hello world");

const xml = buildRss2({
  title: "Tin <test>",
  link: "https://giahomnay.site/tin-tuc",
  description: "Feed & news",
  selfUrl: "https://giahomnay.site/feed/news.xml",
  items: [
    {
      title: "Giá vàng & SJC",
      link: "https://giahomnay.site/tin-tuc/a.html",
      guid: "https://giahomnay.site/tin-tuc/a.html",
      description: "Mô tả <b>HTML</b>",
      pubDate: new Date("2026-07-18T01:00:00.000Z"),
      category: "Giá vàng",
    },
  ],
});

assert.match(xml, /<rss version="2\.0"/);
assert.match(xml, /Giá vàng &amp; SJC/);
assert.match(xml, /Mô tả &lt;b&gt;HTML&lt;\/b&gt;/);
assert.match(xml, /atom:link/);
assert.doesNotMatch(xml, /Giá vàng & SJC/);

console.log("rss.check ok");
