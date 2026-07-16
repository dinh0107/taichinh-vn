/**
 * Runnable check for parseAiConfig — fails loudly if clamps/defaults break.
 * Run: npx tsx src/modules/admin/settings-shared.ai-check.ts
 */
import { parseAiConfig, SETTING_DEFAULTS } from "./settings-shared";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const cfg = parseAiConfig({
  ...SETTING_DEFAULTS,
  ai_temperature: "9",
  ai_max_tokens: "10",
  ai_cron_hour: "99",
  ai_publish_mode: "NOPE",
  ai_write_categories: "GOLD, HACKER, ECONOMY",
  ai_auto_write: "true",
});

assert(cfg.temperature === 2, `temp clamp: ${cfg.temperature}`);
assert(cfg.maxTokens === 256, `tokens clamp: ${cfg.maxTokens}`);
assert(cfg.cronHour === 23, `hour clamp: ${cfg.cronHour}`);
assert(cfg.publishMode === "DRAFT", `mode: ${cfg.publishMode}`);
assert(cfg.categories.includes("GOLD") && cfg.categories.includes("ECONOMY"), "cats");
assert(!cfg.categories.includes("HACKER"), "invalid cats filtered");
assert(cfg.autoWrite === true, "autoWrite");
assert(cfg.apiKey === null, "no key");

console.log("parseAiConfig ok");
