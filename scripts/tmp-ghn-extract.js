const fs = require("fs");
const path = require("path");
const temp = process.env.TEMP || "/tmp";
const h = fs.readFileSync(path.join(temp, "ghn-full.html"), "utf8");

const css = [...h.matchAll(/href="(\/_next\/static\/css\/[^"]+)"/g)].map((m) => m[1]);
console.log("CSS:", css);

const main = h.match(/<main[\s\S]*?<\/main>/i);
fs.writeFileSync(path.join(temp, "ghn-main.html"), main ? main[0] : "no main");
console.log("main len", main ? main[0].length : 0);

const hdr = h.match(/<header[\s\S]*?<\/header>/i);
fs.writeFileSync(path.join(temp, "ghn-header.html"), hdr ? hdr[0] : "no header");
console.log("header len", hdr ? hdr[0].length : 0);

const ftr = h.match(/<footer[\s\S]*?<\/footer>/i);
fs.writeFileSync(path.join(temp, "ghn-footer.html"), ftr ? ftr[0] : "no footer");
console.log("footer len", ftr ? ftr[0].length : 0);

// Strip scripts and keep visible text structure sample
const readable = (main ? main[0] : h)
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .slice(0, 25000);
fs.writeFileSync(path.join(temp, "ghn-main-snip.html"), readable);
console.log("wrote snip");
