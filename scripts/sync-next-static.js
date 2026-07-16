/**
 * Shared IIS static sync: .next/static → _next/static
 * Avoids full-tree delete (Windows/iisnode often locks files → partial sync → missing CSS).
 * Never wipe destination CSS if source has no CSS (prevents unstyled live site).
 */
const fs = require("node:fs");
const path = require("node:path");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function countCssFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith(".css")) n += 1;
    }
  };
  walk(dir);
  return n;
}

function copyFileRobust(from, to) {
  ensureDir(path.dirname(to));
  try {
    fs.copyFileSync(from, to);
  } catch {
    const tmp = `${to}.${process.pid}.tmp`;
    fs.copyFileSync(from, tmp);
    try {
      fs.renameSync(tmp, to);
    } catch {
      fs.copyFileSync(tmp, to);
      try {
        fs.unlinkSync(tmp);
      } catch {
        /* ignore */
      }
    }
  }
}

function mirrorDir(src, dest, stats, { purgeStale = false } = {}) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  const seen = new Set();

  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    seen.add(entry.name);
    if (entry.isDirectory()) {
      mirrorDir(from, to, stats, { purgeStale });
    } else {
      copyFileRobust(from, to);
      stats.files += 1;
      if (entry.name.endsWith(".css")) stats.css += 1;
      if (entry.name.endsWith(".js")) stats.js += 1;
    }
  }

  // ponytail: default keep stale chunks — deleting mid-session causes ChunkLoadError
  // after deploy while tabs still hold the previous build. Disk grows; purge later.
  if (!purgeStale) return;

  for (const entry of fs.readdirSync(dest, { withFileTypes: true })) {
    if (seen.has(entry.name)) continue;
    const stale = path.join(dest, entry.name);
    try {
      fs.rmSync(stale, { recursive: true, force: true });
      stats.removed += 1;
    } catch {
      /* locked — leave it */
    }
  }
}

/**
 * @param {string} root project root
 * @param {{ purgeStale?: boolean }} [opts]
 * @returns {{ ok: boolean, files: number, css: number, js: number, removed: number, error?: string }}
 */
function syncNextStatic(root, opts = {}) {
  const src = path.join(root, ".next", "static");
  const dest = path.join(root, "_next", "static");
  const stats = { files: 0, css: 0, js: 0, removed: 0 };

  if (!fs.existsSync(src)) {
    return { ok: false, ...stats, error: "missing .next/static" };
  }

  const srcCss = countCssFiles(src);
  if (srcCss < 1) {
    return {
      ok: false,
      ...stats,
      error: "no CSS in .next/static — refuse to sync (would wipe live CSS)",
    };
  }

  try {
    mirrorDir(src, dest, stats, { purgeStale: Boolean(opts.purgeStale) });
    if (stats.css < 1) {
      return {
        ok: false,
        ...stats,
        error: "copied 0 CSS files despite source having CSS",
      };
    }
    return { ok: true, ...stats };
  } catch (err) {
    return {
      ok: false,
      ...stats,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

module.exports = { syncNextStatic, countCssFiles };
