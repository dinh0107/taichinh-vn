/**
 * Runnable check — fill + parse helpers for AI daily article.
 * Run: npx tsx src/modules/ai/daily-article.check.ts
 */
import {
  buildAiArticleMessages,
  fillArticlePrompt,
  parseArticleJson,
} from "./daily-article";
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

const single = fillArticlePrompt("Topic={topic} D={date}", {
  topic: "Giá vàng",
  date: "16/07/2026",
  data: "x",
});
assert(single === "Topic=Giá vàng D=16/07/2026", `single brace: ${single}`);

const msgs = buildAiArticleMessages(
  {
    systemPrompt: "Biên tập viên",
    articlePrompt: "Viết về {{topic}} ngày {{date}} không có số liệu.",
  },
  {
    topic: "Giá vàng",
    date: "16/07/2026",
    data: "SJC mua 1 / bán 2",
  }
);
assert(msgs[0].role === "system" && msgs[0].content === "Biên tập viên", "system");
assert(msgs[1].role === "user", "user role");
assert(msgs[1].content.includes("Giá vàng"), "topic in user");
assert(msgs[1].content.includes("SJC mua 1 / bán 2"), "data injected when missing");
assert(msgs[1].content.includes("contentHtml"), "json schema at end");
assert(!msgs[0].content.includes("{{data}}"), "no raw placeholder in system");

const withData = buildAiArticleMessages(
  {
    systemPrompt: "S",
    articlePrompt: "Dùng: {{data}}",
  },
  { topic: "T", date: "D", data: "LINE_UNIQUE_DATA_XYZ" }
);
assert(
  (withData[1].content.match(/LINE_UNIQUE_DATA_XYZ/g) || []).length === 1,
  "do not duplicate data when already in prompt"
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
