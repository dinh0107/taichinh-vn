/**
 * ponytail: gold title date format must match SERP spec.
 * Run: npx tsx src/lib/time-title.check.ts
 */
import assert from "node:assert/strict";
import {
  goldMoiNhatTitle,
  GOLD_MOI_NHAT_TITLE_BASE,
  withHomNayTitlePrefix,
} from "./time";

const now = new Date("2026-07-18T05:00:00.000Z");

assert.equal(
  goldMoiNhatTitle(now),
  withHomNayTitlePrefix(GOLD_MOI_NHAT_TITLE_BASE, now)
);

assert.match(
  goldMoiNhatTitle(now),
  /^Giá vàng hôm nay \d{2}\/\d{2}\/\d{4} mới nhất - SJC, DOJI, PNJ$/
);

assert.match(
  withHomNayTitlePrefix(
    "Giá vàng hôm nay 01/01/2020 mới nhất - SJC, DOJI, PNJ",
    now
  ),
  /^Giá vàng hôm nay \d{2}\/\d{2}\/\d{4} mới nhất - SJC, DOJI, PNJ$/
);

assert.match(
  withHomNayTitlePrefix("Giá vàng SJC hôm nay", now),
  /^Giá vàng SJC hôm nay ngày \d{2}\/\d{2}\/\d{4}$/
);

console.log("time-title.check ok");
