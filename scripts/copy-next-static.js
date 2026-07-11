/**
 * IIS/Plesk cannot reliably serve files from the hidden `.next` folder.
 * Copy build assets to `_next/static` so `/_next/static/*` resolves on disk.
 */
const fs = require("node:fs");
const path = require("node:path");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

const root = path.join(__dirname, "..");
const src = path.join(root, ".next", "static");
const destRoot = path.join(root, "_next");
const dest = path.join(destRoot, "static");

if (!fs.existsSync(src)) {
  console.error("[copy-next-static] Missing .next/static — run next build first.");
  process.exit(1);
}

fs.rmSync(destRoot, { recursive: true, force: true });
copyDir(src, dest);
console.log("[copy-next-static] Copied .next/static → _next/static (for IIS)");
