/**
 * Windows/Plesk-safe prisma generate.
 * EPERM happens when iisnode still locks query_engine-windows.dll.node.
 * postinstall must not fail the whole `npm install` in that case.
 */
const { spawnSync } = require("node:child_process");

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (result.status === 0) {
  process.exit(0);
}

console.warn("");
console.warn("[prisma-generate-safe] prisma generate failed (often EPERM on Windows).");
console.warn("  1) Plesk → Node.js → Disable / Stop app");
console.warn("  2) rmdir /s /q node_modules\\.prisma");
console.warn("  3) npx prisma generate");
console.warn("  4) Enable / Restart app");
console.warn("");
process.exit(0);
