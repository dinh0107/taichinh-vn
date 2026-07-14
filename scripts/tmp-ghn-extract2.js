const fs = require("fs");
const path = require("path");
const temp = process.env.TEMP || "/tmp";
const h = fs.readFileSync(path.join(temp, "ghn-full.html"), "utf8");

console.log("total", h.length);
console.log("has __NEXT_DATA__", h.includes("__NEXT_DATA__"));

const nd = h.match(
  /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
);
if (nd) {
  fs.writeFileSync(path.join(temp, "ghn-next-data.json"), nd[1]);
  console.log("nextdata", nd[1].length);
  try {
    const j = JSON.parse(nd[1]);
    console.log("page", j.page);
    console.log("buildId", j.buildId);
    const keys = Object.keys(j.props?.pageProps || {});
    console.log("pageProps keys", keys);
  } catch (e) {
    console.log("parse err", e.message);
  }
}

// Extract text content of hero-ish areas
const text = h
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<[^>]+>/g, "\n")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/\n+/g, "\n")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 1 && s.length < 120)
  .slice(0, 200);
fs.writeFileSync(path.join(temp, "ghn-texts.txt"), text.join("\n"));
console.log("texts sample written", text.length);

// Unique class tokens counting blue/slate patterns from header
const hdr = fs.readFileSync(path.join(temp, "ghn-header.html"), "utf8");
const classAttrs = [...hdr.matchAll(/class="([^"]+)"/g)].map((m) => m[1]);
const tokenCount = {};
for (const c of classAttrs) {
  for (const t of c.split(/\s+/)) {
    tokenCount[t] = (tokenCount[t] || 0) + 1;
  }
}
const top = Object.entries(tokenCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 60);
console.log("top header classes:\n", top.map(([k, v]) => `${v}\t${k}`).join("\n"));
