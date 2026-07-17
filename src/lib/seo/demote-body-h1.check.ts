/**
 * ponytail: demoteBodyH1 must leave at most zero <h1> in body HTML.
 * Run: npx tsx src/lib/seo/demote-body-h1.check.ts
 */
import assert from "node:assert/strict";
import { demoteBodyH1 } from "./demote-body-h1";

assert.equal(demoteBodyH1("<p>x</p>"), "<p>x</p>");
assert.equal(
  demoteBodyH1('<h1 class="t">Title</h1><p>body</p>'),
  '<h2 class="t">Title</h2><p>body</p>'
);
assert.equal(
  demoteBodyH1("<H1>A</H1><h1>B</h1>"),
  "<h2>A</h2><h2>B</h2>"
);
assert.equal((demoteBodyH1("<h1>A</h1><h2>B</h2>").match(/<h1\b/gi) || []).length, 0);

console.log("demote-body-h1.check ok");
