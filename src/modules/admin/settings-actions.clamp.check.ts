import assert from "node:assert/strict";

/** Mirrors clampNumber in settings-actions.ts */
function clampNumber(
  raw: string,
  min: number,
  max: number,
  fallback: number,
  integer = false
): string {
  if (!raw.trim()) return String(fallback);
  const n = Number(raw);
  if (!Number.isFinite(n)) return String(fallback);
  const clamped = Math.min(max, Math.max(min, n));
  return String(integer ? Math.round(clamped) : clamped);
}

assert.equal(clampNumber("0.7", 0, 2, 0.7), "0.7");
assert.equal(clampNumber("99", 0, 23, 7, true), "23");
assert.equal(clampNumber("2000.7", 256, 8000, 2000, true), "2001");
assert.equal(clampNumber("", 0, 23, 7, true), "7");
console.log("settings clampNumber: ok");
