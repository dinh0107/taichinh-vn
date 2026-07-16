/**
 * gscCoverageState must fit MySQL VARCHAR(191) until @db.Text is applied.
 * Run: npx tsx src/modules/admin/gsc-sync.clip.check.ts
 */
import assert from "node:assert/strict";

function clipCoverage(value: string | null | undefined, max = 190): string | null {
  if (value == null) return null;
  const s = value.trim();
  if (!s) return null;
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

assert.equal(clipCoverage(null), null);
assert.equal(clipCoverage("  "), null);
assert.equal(clipCoverage("Submitted and indexed"), "Submitted and indexed");
const long = "x".repeat(600);
const clipped = clipCoverage(long)!;
assert.equal(clipped.length, 190);
assert.ok(clipped.endsWith("…"));
console.log("gsc clipCoverage: ok");
