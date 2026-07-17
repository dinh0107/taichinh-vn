/**
 * ponytail: runnable check for readPngSize — fails if IHDR parse breaks.
 * Run: npx tsx src/lib/png-size.check.ts
 */
import assert from "node:assert/strict";
import { readPngSize } from "./png-size";

const oneByOne = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const size = readPngSize(oneByOne);
assert.ok(size);
assert.equal(size.width, 1);
assert.equal(size.height, 1);
assert.equal(readPngSize(Buffer.from("not-png")), null);
console.log("png-size.check ok");
