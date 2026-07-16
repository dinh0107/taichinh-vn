/**
 * OpenAI-compatible Chat Completions client (OpenAI + OpenRouter).
 */
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatCompletionOpts = {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  /** e.g. https://api.openai.com/v1 or https://openrouter.ai/api/v1 */
  baseUrl?: string;
  /** OpenRouter: HTTP-Referer */
  referer?: string;
  /** OpenRouter: X-Title */
  title?: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  timeoutMs?: number;
};

export async function chatCompletion(opts: ChatCompletionOpts): Promise<string> {
  const base = (opts.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  const url = `${base}/chat/completions`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 90_000);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${opts.apiKey}`,
    "Content-Type": "application/json",
  };
  if (opts.referer) headers["HTTP-Referer"] = opts.referer;
  if (opts.title) headers["X-Title"] = opts.title;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 2000,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });

    const raw = await res.text();
    if (!res.ok) {
      throw new Error(`AI HTTP ${res.status}: ${raw.slice(0, 400)}`);
    }

    const data = JSON.parse(raw) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("AI trả về content rỗng");
    return content;
  } finally {
    clearTimeout(timer);
  }
}
