const fs = require("fs");
const path = require("path");
const temp = process.env.TEMP || "/tmp";
const h = fs.readFileSync(path.join(temp, "ghn-full.html"), "utf8");

// Find market dashboard / main content after tabs
const markers = [
  "Thị trường",
  "Tổng quan",
  "Dữ liệu thị trường realtime",
  "Giá vàng SJC hôm nay",
  "Giá xăng dầu",
  "Lãi suất ngân hàng",
  "Tin tức thị trường",
  "Tỷ giá Vietcombank",
  "Giá bán lẻ",
  "Biểu đồ",
  "crypto",
  "Bitcoin",
  "WTI",
  "sidebar",
];

for (const m of markers) {
  const i = h.toLowerCase().indexOf(m.toLowerCase());
  console.log(m, i >= 0 ? i : "MISSING");
}

// Extract a window around "Dữ liệu thị trường realtime"
const idx = h.indexOf("Dữ liệu thị trường realtime");
if (idx >= 0) {
  const slice = h.slice(idx - 500, idx + 8000);
  fs.writeFileSync(path.join(temp, "ghn-hero-region.html"), slice);
  console.log("hero region written", slice.length);
}

const idx2 = h.indexOf("Giá vàng SJC hôm nay");
if (idx2 >= 0) {
  fs.writeFileSync(
    path.join(temp, "ghn-gold-region.html"),
    h.slice(idx2 - 300, idx2 + 12000)
  );
}

// CSS custom properties
const css = fs.readFileSync(path.join(temp, "ghn-style.css"), "utf8");
const vars = [...css.matchAll(/--[a-zA-Z0-9_-]+\s*:\s*[^;]+/g)]
  .map((m) => m[0])
  .slice(0, 80);
console.log("CSS vars sample:\n" + vars.join("\n"));

// Look for max-w containers
const maxw = [...css.matchAll(/max-width:\s*([^;}]+)/g)].map((m) => m[1]);
const uniq = [...new Set(maxw)].slice(0, 30);
console.log("max-widths", uniq);

// Extract text about dashboard subtitle
const dash = h.match(/dashboard[^<]{0,80}/i);
console.log("dash", dash && dash[0]);
