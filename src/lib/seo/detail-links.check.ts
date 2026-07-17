/**
 * ponytail: detail-link maps must match real SEO slugs; fails if a mapping drifts.
 * Run: npx tsx src/lib/seo/detail-links.check.ts
 */
import assert from "node:assert/strict";
import {
  goldDetailHref,
  fxDetailHref,
  interestDetailHref,
  fuelDetailHref,
  stockDetailHref,
} from "./detail-links";

assert.equal(goldDetailHref({ brand: "SJC" }), "/gia-vang-sjc-hom-nay");
assert.equal(goldDetailHref({ brand: "BAO_TIN" }), "/gia-vang-bao-tin-hom-nay");
assert.equal(goldDetailHref({ purity: "K9999" }), "/gia-vang-9999-hom-nay");
assert.equal(goldDetailHref({ brand: "OTHER" }), null);
assert.equal(goldDetailHref({}), null);

assert.equal(fxDetailHref("USD"), "/ty-gia-usd-hom-nay");
assert.equal(fxDetailHref("cny"), "/ty-gia-cny-hom-nay");
assert.equal(fxDetailHref("THB"), null);

assert.equal(interestDetailHref("Vietcombank"), "/lai-suat-vietcombank");
assert.equal(interestDetailHref("MB Bank"), "/lai-suat-mb-bank");
assert.equal(interestDetailHref("Ngân hàng lạ"), null);

assert.equal(fuelDetailHref("RON95"), "/gia-xang-ron95-hom-nay");
assert.equal(fuelDetailHref("E5"), "/gia-xang-e5-hom-nay");
assert.equal(fuelDetailHref("KEROSENE"), null);

assert.equal(stockDetailHref("VNINDEX"), "/chung-khoan-vnindex");
assert.equal(stockDetailHref("UPCOM"), "/chung-khoan-upcom");
assert.equal(stockDetailHref("XYZ"), null);

console.log("detail-links.check ok");
