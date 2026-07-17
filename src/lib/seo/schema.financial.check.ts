/**
 * FinancialService schema must include Rich Results recommended fields.
 * Run: npx tsx src/lib/seo/schema.financial.check.ts
 */
import assert from "node:assert/strict";
import { buildFinancialServiceSchema } from "./schema";

const s = buildFinancialServiceSchema(
  "Giá vàng Việt Nam",
  "Tra cứu giá vàng",
  "Giá Hôm Nay",
  { telephone: "+84 28 1234 5678" }
);

assert.equal(s["@type"], "FinancialService");
assert.ok(typeof s.image === "string" && String(s.image).length > 0, "image");
assert.equal(s.priceRange, "Miễn phí");
assert.ok(s.address && typeof s.address === "object", "address");
assert.equal((s.address as { addressCountry?: string }).addressCountry, "VN");
assert.equal(s.telephone, "+84 28 1234 5678");

const noPhone = buildFinancialServiceSchema("A", "B");
assert.equal(noPhone.telephone, undefined);
assert.ok(noPhone.image);
assert.ok(noPhone.priceRange);
assert.ok(noPhone.address);

console.log("schema.financial: ok");
