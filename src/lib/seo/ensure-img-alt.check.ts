/**
 * ponytail: ensureImgAlt must add missing alt and keep existing ones.
 * Run: npx tsx src/lib/seo/ensure-img-alt.check.ts
 */
import assert from "node:assert/strict";
import { ensureImgAlt } from "./ensure-img-alt";

assert.equal(ensureImgAlt("<p>x</p>"), "<p>x</p>");
assert.equal(
  ensureImgAlt('<img src="a.jpg">', "Tiêu đề"),
  '<img alt="Tiêu đề" src="a.jpg">'
);
assert.equal(
  ensureImgAlt('<img src="a.jpg" alt="Đã có">', "X"),
  '<img src="a.jpg" alt="Đã có">'
);
assert.equal(
  ensureImgAlt('<img src="a.jpg" alt="">', "Bài viết"),
  '<img src="a.jpg" alt="Bài viết">'
);
assert.equal(ensureImgAlt("<IMG SRC='x.png'>"), '<img alt="" SRC=\'x.png\'>');

console.log("ensure-img-alt.check ok");
