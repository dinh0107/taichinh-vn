import { ArticleStatus, NewsCategoryCode, type Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "@/lib/db";
import { chatCompletion } from "@/lib/openai";
import { logger } from "@/lib/logger";
import { slugify } from "@/lib/utils";
import { todayDateVi, hourVn } from "@/lib/time";
import { getAiConfig } from "@/modules/admin/settings-service";
import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { getCurrentGoldPrices } from "@/modules/gold/service";
import { getForexRatesByBank } from "@/modules/forex/service";
import { getInterestRatesByBank } from "@/modules/interest/service";

const ArticleJsonSchema = z.object({
  title: z.string().min(8).max(200),
  excerpt: z.string().max(500).optional().default(""),
  contentHtml: z.string().min(40),
  seoDescription: z.string().max(200).optional().default(""),
  faqs: z
    .array(
      z.object({
        question: z.string().min(5),
        answer: z.string().min(5),
      })
    )
    .max(8)
    .optional()
    .default([]),
});

export type DailyAiArticleResult = {
  skipped: boolean;
  reason?: string;
  created?: boolean;
  articleId?: string;
  slug?: string;
  category?: NewsCategoryCode;
  status?: ArticleStatus;
};

export function fillArticlePrompt(
  template: string,
  vars: { topic: string; date: string; data: string }
): string {
  let out = template;
  for (const [key, val] of Object.entries(vars)) {
    // Support {{topic}} and {topic} (admins often type single braces).
    out = out.replaceAll(`{{${key}}}`, val).replaceAll(`{${key}}`, val);
  }
  return out;
}

/** Assemble chat messages so Admin prompts drive content; JSON is output only. */
export function buildAiArticleMessages(
  cfg: { systemPrompt: string; articlePrompt: string },
  vars: { topic: string; date: string; data: string }
): { role: "system" | "user"; content: string }[] {
  const filled = fillArticlePrompt(cfg.articlePrompt, vars);
  // If the template omitted {{data}}, still inject live numbers (otherwise model invents).
  const dataAlreadyInPrompt =
    vars.data.trim().length > 0 && filled.includes(vars.data.trim().slice(0, 48));
  const dataBlock = dataAlreadyInPrompt
    ? ""
    : `\n\n--- SỐ LIỆU THỊ TRƯỜNG (bắt buộc dùng đúng, không bịa thêm) ---\n${vars.data}\n--- HẾT SỐ LIỆU ---`;

  const formatBlock = `

Trả lời DUY NHẤT một JSON object hợp lệ (không bọc markdown) đúng schema:
{"title":"string","excerpt":"string","contentHtml":"HTML tiếng Việt","seoDescription":"≤155 ký tự","faqs":[{"question":"...","answer":"..."}]}
contentHtml chỉ dùng p, h2, ul, li, strong (không h1). Tuân thủ yêu cầu viết bài ở trên (cấu trúc, độ dài, giọng văn); mọi số liệu chỉ lấy từ phần số liệu đã cung cấp.`;

  return [
    {
      role: "system",
      content: cfg.systemPrompt.trim(),
    },
    {
      role: "user",
      content: `${filled}${dataBlock}${formatBlock}`,
    },
  ];
}

export function parseArticleJson(raw: string) {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return ArticleJsonSchema.parse(JSON.parse(cleaned));
}

function pickCategory(categories: string[], now = new Date()): NewsCategoryCode {
  const day = Math.floor(now.getTime() / 86_400_000);
  const idx = categories.length > 0 ? day % categories.length : 0;
  const code = (categories[idx] || "GOLD") as NewsCategoryCode;
  return Object.values(NewsCategoryCode).includes(code)
    ? code
    : NewsCategoryCode.GOLD;
}

function formatVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

async function buildMarketData(category: NewsCategoryCode): Promise<string> {
  const lines: string[] = [];

  if (
    category === NewsCategoryCode.GOLD ||
    category === NewsCategoryCode.ECONOMY ||
    category === NewsCategoryCode.GENERAL
  ) {
    try {
      const prices = await getCurrentGoldPrices();
      lines.push("Giá vàng (mua/bán):");
      for (const p of prices.slice(0, 12)) {
        lines.push(
          `- ${p.nameVi}: mua ${formatVnd(p.buy)} / bán ${formatVnd(p.sell)} (Δ bán ${p.changeSell})`
        );
      }
    } catch (e) {
      logger.warn({ err: e }, "AI daily: gold data failed");
    }
  }

  if (
    category === NewsCategoryCode.BANKING ||
    category === NewsCategoryCode.ECONOMY ||
    category === NewsCategoryCode.GENERAL
  ) {
    try {
      const banks = await getInterestRatesByBank();
      const termLabels = ["KKH", "1T", "3T", "6T", "12T"];
      lines.push("Lãi suất tiết kiệm (%/năm):");
      for (const b of banks.slice(0, 6)) {
        const sample = b.rates
          .map((r, i) => `${termLabels[i] ?? i}: ${r}`)
          .join("; ");
        lines.push(`- ${b.name}: ${sample}`);
      }
    } catch (e) {
      logger.warn({ err: e }, "AI daily: interest data failed");
    }
  }

  if (
    category === NewsCategoryCode.ECONOMY ||
    category === NewsCategoryCode.GENERAL ||
    category === NewsCategoryCode.STOCKS
  ) {
    try {
      const forex = await getForexRatesByBank();
      const first = forex[0];
      if (first) {
        lines.push(`Tỷ giá (${first.bankName}):`);
        for (const [currency, r] of Object.entries(first.rates).slice(0, 6)) {
          lines.push(
            `- ${currency}: mua ${formatVnd(r.buy)} / bán ${formatVnd(r.sell)}`
          );
        }
      }
    } catch (e) {
      logger.warn({ err: e }, "AI daily: forex data failed");
    }
  }

  if (lines.length === 0) {
    return "Không có số liệu thị trường lúc này — viết khung phân tích chung, nêu rõ thiếu dữ liệu, không bịa số.";
  }
  return lines.join("\n");
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || `ai-bai-${Date.now()}`;
  let slug = root;
  let i = 1;
  while (true) {
    const existing = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${root}-${i++}`;
  }
}

/**
 * Generate one SEO article from live market data + admin AI settings.
 * No per-day cap — cron + Admin may create as many as needed.
 */
export async function writeDailyAiArticle(opts?: {
  force?: boolean;
  /** Hourly Task Scheduler tick — enforce Admin `ai_cron_hour`. Manual runs omit this. */
  scheduled?: boolean;
  category?: NewsCategoryCode;
}): Promise<DailyAiArticleResult> {
  const cfg = await getAiConfig();

  if (!opts?.force && !cfg.autoWrite) {
    return { skipped: true, reason: "ai_auto_write đang tắt" };
  }
  if (!cfg.apiKey) {
    return { skipped: true, reason: "Thiếu OpenAI API Key" };
  }

  // Hourly scheduler only — manual / force bỏ qua kiểm tra giờ.
  const nowHour = hourVn();
  if (opts?.scheduled && !opts?.force && nowHour !== cfg.cronHour) {
    return {
      skipped: true,
      reason: `Chưa tới giờ (VN ${nowHour}:00, cấu hình ${cfg.cronHour}:00)`,
    };
  }

  const category =
    opts?.category ?? pickCategory(cfg.categories);

  const date = todayDateVi();
  const topic = NEWS_CATEGORY_LABELS[category];
  const data = await buildMarketData(category);
  const messages = buildAiArticleMessages(cfg, { topic, date, data });

  // 600–900 từ tiếng Việt + HTML/JSON dễ vượt 2k tokens — floor để khỏi cắt cụt prompt.
  const maxTokens = Math.max(cfg.maxTokens, 3500);

  const raw = await chatCompletion({
    apiKey: cfg.apiKey,
    model: cfg.model,
    baseUrl: cfg.baseUrl,
    referer: cfg.provider === "openrouter" ? cfg.siteUrl : undefined,
    title: cfg.provider === "openrouter" ? "GiaHomNay AI" : undefined,
    temperature: cfg.temperature,
    maxTokens,
    json: true,
    messages,
  });

  const parsed = parseArticleJson(raw);
  const status =
    cfg.publishMode === "PUBLISHED"
      ? ArticleStatus.PUBLISHED
      : ArticleStatus.DRAFT;
  const slug = await uniqueSlug(parsed.title);
  const seoDescription = (
    parsed.seoDescription ||
    parsed.excerpt ||
    parsed.title
  ).slice(0, 160);

  // Lưu FAQ khi model trả về (prompt Admin thường yêu cầu) — không phụ thuộc toggle.
  const faqs = parsed.faqs.slice(0, 5).map((f, i) => ({
    question: f.question.slice(0, 200),
    answer: f.answer.slice(0, 2000),
    sortOrder: i,
  }));

  const createData: Prisma.NewsArticleCreateInput = {
    title: parsed.title.slice(0, 200),
    slug,
    excerpt: (parsed.excerpt || parsed.title).slice(0, 500),
    content: parsed.contentHtml,
    category,
    source: "AI",
    status,
    isAiGenerated: true,
    seoTitle: parsed.title.slice(0, 70),
    seoDescription,
    publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : null,
    ...(faqs.length > 0 ? { faqs: { create: faqs } } : {}),
  };

  const article = await prisma.newsArticle.create({ data: createData });

  logger.info(
    { articleId: article.id, slug, category, status },
    "AI daily article created"
  );

  return {
    skipped: false,
    created: true,
    articleId: article.id,
    slug: article.slug,
    category,
    status,
  };
}
