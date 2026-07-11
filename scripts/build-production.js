/**
 * Production build wrapper for Plesk/Windows.
 * NODE_ENV=development in .env breaks Next.js 16 prerender
 * (workStore / _global-error). Strip it for the duration of the build.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");

let originalEnv = null;

function stripNodeEnvFromDotEnv() {
  if (!fs.existsSync(envPath)) return;
  originalEnv = fs.readFileSync(envPath, "utf8");
  const patched = originalEnv
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*NODE_ENV\s*=/.test(line)) {
        return `# ${line.trim()}  # auto-stripped by build-production.js`;
      }
      return line;
    })
    .join("\n");
  if (patched !== originalEnv) {
    fs.writeFileSync(envPath, patched, "utf8");
    console.log("[build] Temporarily commented NODE_ENV in .env for next build");
  }
}

function restoreDotEnv() {
  if (originalEnv !== null) {
    fs.writeFileSync(envPath, originalEnv, "utf8");
    console.log("[build] Restored .env");
  }
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });
  return result.status ?? 1;
}

stripNodeEnvFromDotEnv();
let code = 1;
try {
  code = run("npx", ["next", "build"]);
  if (code === 0) {
    code = run("node", ["scripts/copy-next-static.js"]);
  }
} finally {
  restoreDotEnv();
}

process.exit(code);
