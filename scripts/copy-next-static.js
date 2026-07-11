/**
 * IIS/Plesk cannot reliably serve files from the hidden `.next` folder.
 * Copy build assets to `_next/static` so `/_next/static/*` resolves on disk.
 */
const path = require("node:path");
const { syncNextStatic } = require("./sync-next-static");

const root = path.join(__dirname, "..");
const result = syncNextStatic(root);

if (!result.ok) {
  console.error("[copy-next-static] Failed:", result.error || "unknown");
  process.exit(1);
}

console.log(
  `[copy-next-static] Synced .next/static → _next/static (${result.files} files, ${result.css} css, removed ${result.removed} stale)`
);

if (result.css < 1) {
  console.error("[copy-next-static] No CSS files synced — UI will be unstyled on IIS.");
  process.exit(1);
}
