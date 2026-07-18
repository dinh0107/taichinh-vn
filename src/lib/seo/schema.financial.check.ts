/**
 * Service schema (not LocalBusiness) — no review/aggregateRating required.
 * Run: npx tsx src/lib/seo/schema.financial.check.ts
 */
import assert from "node:assert/strict";
import { buildFinancialServiceSchema, buildGoldPriceSchema } from "./schema";

const s = buildFinancialServiceSchema(
  "Giá vàng Việt Nam",
  "Tra cứu giá vàng",
  "Giá Hôm Nay",
  { telephone: "+84 28 1234 5678", url: "https://example.com/gia-vang" }
);

assert.equal(s["@type"], "Service");
assert.ok(s.provider && typeof s.provider === "object");
assert.equal((s.provider as { "@type": string })["@type"], "Organization");
assert.equal(
  (s.provider as { telephone?: string }).telephone,
  "+84 28 1234 5678"
);
assert.ok(typeof s.image === "string" && String(s.image).length > 0, "image");
assert.equal(s.url, "https://example.com/gia-vang");
assert.equal(s.alternateName, "Giá Hôm Nay");
assert.equal((s.offers as { price?: string }).price, "0");

const noPhone = buildFinancialServiceSchema("A", "B");
assert.equal(
  (noPhone.provider as { telephone?: string }).telephone,
  undefined
);
assert.ok(noPhone.image);
assert.ok(noPhone.offers);

const gold = buildGoldPriceSchema([
  {
    code: "SJL1L10",
    name: "SJC",
    buy: 145_000_000,
    sell: 148_000_000,
    change: 0,
    brand: "SJC",
    recordedAt: new Date(),
  } as never,
]);
assert.equal(gold["@type"], "Dataset");
assert.ok(!("aggregateRating" in gold));
assert.ok(!("review" in gold));

console.log("schema.financial: ok");
