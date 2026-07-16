export type UploadState = {
  ok: boolean;
  error?: string;
  message?: string;
  version?: number;
};

export type SiteSettings = Record<string, string>;

export type SaveSettingsState = {
  ok: boolean;
  message?: string;
  error?: string;
};

export const SETTING_DEFAULTS: SiteSettings = {
  site_name: "TaiChinh.vn",
  site_url: "https://taichinh.vn",
  site_description: "Nền tảng tài chính cá nhân Việt Nam",
  brand_asset_version: "0",
  gold_api_endpoint: "https://giavang.now/en/api",
  redis_url: "redis://localhost:6379",
  adsense_publisher_id: "",
  enable_adsense: "true",
  enable_ad_banner: "true",
  enable_affiliate: "true",
  // AI — defaults off until admin configures a key + turns features on
  ai_provider: "auto",
  ai_base_url: "",
  ai_model: "openai/gpt-4o-mini",
  ai_temperature: "0.7",
  ai_max_tokens: "2000",
  ai_cron_hour: "7",
  ai_publish_mode: "DRAFT",
  ai_write_categories: "GOLD,ECONOMY",
  ai_system_prompt:
    "Bạn là biên tập viên tài chính Việt Nam. Viết tiếng Việt chuẩn, khách quan, dựa trên số liệu được cung cấp. Không bịa số liệu. Có tiêu đề hấp dẫn SEO, đoạn mở ngắn, và kết có disclaimer rủi ro.",
  ai_article_prompt:
    "Viết bài phân tích {{topic}} hôm nay {{date}}. Dùng số liệu: {{data}}. Độ dài khoảng 600–900 từ. Thêm meta description ≤155 ký tự và 3–5 FAQ ngắn.",
  ai_auto_write: "false",
  ai_auto_summarize: "false",
  ai_auto_faq: "false",
  gsc_property_url: "https://taichinh.vn/",
  gsc_client_email: "",
  /** Raw HTML for <head> — GTM/GA/AdSense head snippets. */
  head_scripts: "",
  /** Raw HTML before </body> — GTM noscript, chat widgets, etc. */
  body_scripts: "",
};

export const AI_PROVIDER_OPTIONS = [
  { value: "auto", label: "Tự nhận (theo key)" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "openai", label: "OpenAI" },
] as const;

export const AI_MODEL_OPTIONS = [
  { value: "openai/gpt-4o-mini", label: "OpenRouter: openai/gpt-4o-mini" },
  { value: "openai/gpt-4o", label: "OpenRouter: openai/gpt-4o" },
  { value: "google/gemini-2.0-flash-001", label: "OpenRouter: gemini-2.0-flash" },
  { value: "anthropic/claude-3.5-sonnet", label: "OpenRouter: claude-3.5-sonnet" },
  { value: "gpt-4o-mini", label: "OpenAI: gpt-4o-mini" },
  { value: "gpt-4o", label: "OpenAI: gpt-4o" },
  { value: "gpt-4.1-mini", label: "OpenAI: gpt-4.1-mini" },
  { value: "gpt-4.1", label: "OpenAI: gpt-4.1" },
] as const;

export const AI_CATEGORY_OPTIONS = [
  "GOLD",
  "STOCKS",
  "BANKING",
  "REAL_ESTATE",
  "ECONOMY",
  "GENERAL",
] as const;

export type AiProvider = "openai" | "openrouter";

export type AiConfig = {
  apiKey: string | null;
  provider: AiProvider;
  baseUrl: string;
  siteUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  cronHour: number;
  publishMode: "DRAFT" | "PUBLISHED";
  categories: string[];
  systemPrompt: string;
  articlePrompt: string;
  autoWrite: boolean;
  autoSummarize: boolean;
  autoFaq: boolean;
};

export function resolveAiProvider(
  setting: string | undefined,
  apiKey: string | null | undefined
): AiProvider {
  const s = (setting || "auto").trim().toLowerCase();
  if (s === "openrouter" || s === "openai") return s;
  if (apiKey?.startsWith("sk-or-")) return "openrouter";
  return "openai";
}

export function resolveAiBaseUrl(
  provider: AiProvider,
  customBaseUrl?: string
): string {
  const custom = customBaseUrl?.trim().replace(/\/+$/, "");
  if (custom) return custom;
  return provider === "openrouter"
    ? "https://openrouter.ai/api/v1"
    : "https://api.openai.com/v1";
}

export function parseAiConfig(
  settings: SiteSettings,
  apiKeyFromDb?: string | null
): AiConfig {
  const apiKey = apiKeyFromDb?.trim() || null;
  const provider = resolveAiProvider(settings.ai_provider, apiKey);
  const temp = Number(settings.ai_temperature);
  const maxTokens = Number(settings.ai_max_tokens);
  const hour = Number(settings.ai_cron_hour);
  const mode = settings.ai_publish_mode === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const categories = (settings.ai_write_categories || "")
    .split(",")
    .map((c) => c.trim())
    .filter((c): c is (typeof AI_CATEGORY_OPTIONS)[number] =>
      (AI_CATEGORY_OPTIONS as readonly string[]).includes(c)
    );

  const defaultModel =
    provider === "openrouter" ? "openai/gpt-4o-mini" : "gpt-4o-mini";

  return {
    apiKey,
    provider,
    baseUrl: resolveAiBaseUrl(provider, settings.ai_base_url),
    siteUrl: (settings.site_url || SETTING_DEFAULTS.site_url).replace(/\/+$/, ""),
    model: settings.ai_model?.trim() || defaultModel,
    temperature: Number.isFinite(temp) ? Math.min(2, Math.max(0, temp)) : 0.7,
    maxTokens: Number.isFinite(maxTokens)
      ? Math.min(8000, Math.max(256, Math.round(maxTokens)))
      : 2000,
    cronHour: Number.isFinite(hour)
      ? Math.min(23, Math.max(0, Math.round(hour)))
      : 7,
    publishMode: mode,
    categories:
      categories.length > 0
        ? [...categories]
        : SETTING_DEFAULTS.ai_write_categories.split(","),
    systemPrompt: settings.ai_system_prompt || SETTING_DEFAULTS.ai_system_prompt,
    articlePrompt:
      settings.ai_article_prompt || SETTING_DEFAULTS.ai_article_prompt,
    autoWrite: settings.ai_auto_write === "true",
    autoSummarize: settings.ai_auto_summarize === "true",
    autoFaq: settings.ai_auto_faq === "true",
  };
}
