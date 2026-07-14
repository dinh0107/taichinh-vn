const fs = require("fs");
const path = require("path");
const temp = process.env.TEMP || "/tmp";
const h = fs.readFileSync(path.join(temp, "ghn-full.html"), "utf8");
const css = fs.readFileSync(path.join(temp, "ghn-style.css"), "utf8");

// Extract :root custom props that are semantic
const rootMatch = css.match(/:root\{([^}]+)\}/);
if (rootMatch) {
  console.log("ROOT:", rootMatch[1].slice(0, 2000));
}

// search var definitions
for (const name of [
  "--border-soft",
  "--shadow-soft",
  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--accent-blue",
  "--accent-red",
  "--surface",
  "--bg",
]) {
  const re = new RegExp(name.replace(/-/g, "\\-") + "\\s*:\\s*([^;}\"]+)");
  const m = css.match(re) || h.match(re);
  console.log(name, m ? m[1] : "?");
}

// Extract market tabs region
const tIdx = h.indexOf(">Thị trường<");
console.log("tab idx", tIdx);
if (tIdx > 0) {
  fs.writeFileSync(
    path.join(temp, "ghn-tabs-region.html"),
    h.slice(tIdx - 800, tIdx + 3500)
  );
}

// Sidebar WTI / Bitcoin
const wti = h.indexOf("Giá dầu thô thế giới");
console.log("wti idx", wti);
if (wti > 0) {
  fs.writeFileSync(
    path.join(temp, "ghn-wti-region.html"),
    h.slice(wti - 400, wti + 4000)
  );
}

const btc = h.toLowerCase().indexOf("bitcoin");
console.log("btc", btc);
if (btc > 0) {
  fs.writeFileSync(
    path.join(temp, "ghn-btc-region.html"),
    h.slice(btc - 500, btc + 3000)
  );
}

// Header shell
const hdrStart = h.indexOf("<header");
fs.writeFileSync(
  path.join(temp, "ghn-header-start.html"),
  h.slice(hdrStart, hdrStart + 6000)
);

// Footer
const ftr = h.indexOf("<footer");
fs.writeFileSync(
  path.join(temp, "ghn-footer-start.html"),
  h.slice(ftr, ftr + 5000)
);

// Download hero bg
const https = require("https");
const file = fs.createWriteStream(path.join(temp, "bg-home-hero.webp"));
https.get("https://giahomnay.vn/assets/bg-home-hero.webp", (res) => {
  console.log("hero bg status", res.statusCode, res.headers["content-type"]);
  res.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("hero bg size", fs.statSync(path.join(temp, "bg-home-hero.webp")).size);
  });
});
