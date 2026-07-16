/**
 * Runnable check — fill + parse helpers for AI daily article.
 * Run: npx tsx src/modules/ai/daily-article.check.ts
 */
import { fillArticlePrompt, parseArticleJson } from "./daily-article";
import { hourVn } from "@/lib/time";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const filled = fillArticlePrompt("A {{topic}} B {{date}} C {{data}}", {
  topic: "Giá vàng",
  date: "16/07/2026",
  data: "SJC 100",
});
assert(
  filled === "A Giá vàng B 16/07/2026 C SJC 100",
  `fill failed: ${filled}`
);

const parsed = parseArticleJson(
  JSON.stringify({
    title: "Vàng SJC hôm nay biến động nhẹ",
    excerpt: "Tóm tắt ngắn",
    contentHtml: "<p>Nội dung phân tích đủ dài để qua validate schema.</p>",
    seoDescription: "Meta SEO",
    faqs: [{ question: "Nên mua không?", answer: "Tùy khẩu vị rủi ro." }],
  })
);
assert(parsed.title.includes("Vàng"), "title");
assert(parsed.faqs.length === 1, "faqs");

const h = hourVn(new Date("2026-07-16T00:30:00+00:00"));
assert(h === 7, `hourVn UTC 00:30 -> VN 7, got ${h}`);

console.log("daily-article helpers ok");
