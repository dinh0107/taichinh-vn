const fs = require("fs");
const path = require("path");
const temp = process.env.TEMP || "/tmp";
const h = fs.readFileSync(path.join(temp, "ghn-full.html"), "utf8");

// Find page-container class definition and main grid
const css = fs.readFileSync(path.join(temp, "ghn-style.css"), "utf8");
const pc = css.match(/\.page-container\{[^}]+\}/g);
console.log("page-container", pc);
const sc = css.match(/\.surface-card\{[^}]+\}/g);
console.log("surface-card", sc);
const ui = css.match(/\.ui-card\{[^}]+\}/g);
console.log("ui-card", ui);

// Find the main content grid around home
const idx = h.indexOf('id="home-hero-title"');
console.log("hero title at", idx);
// Walk backwards for grid classes
const before = h.slice(idx - 2500, idx);
const gridMatches = [...before.matchAll(/class="([^"]*grid[^"]*)"/g)].map((m) => m[1]);
console.log("grids before hero:\n", gridMatches.slice(-8).join("\n\n"));

// Horizontal tabs (mobile?)
const mTab = h.indexOf("Theo dõi realtime");
console.log("realtime at", mTab);
if (mTab > 0) {
  fs.writeFileSync(
    path.join(temp, "ghn-realtime-region.html"),
    h.slice(mTab - 2000, mTab + 1500)
  );
}

// Download footer bg
const https = require("https");
https.get("https://giahomnay.vn/assets/bg-footer.webp", (res) => {
  console.log("footer bg", res.statusCode);
  const f = fs.createWriteStream(path.join(temp, "bg-footer.webp"));
  res.pipe(f);
  f.on("finish", () => {
    f.close();
    console.log("footer size", fs.statSync(path.join(temp, "bg-footer.webp")).size);
  });
});
