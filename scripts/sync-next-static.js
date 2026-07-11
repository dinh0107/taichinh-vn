/**
 * Shared IIS static sync: .next/static → _next/static
 * Avoids full-tree delete (Windows/iisnode often locks files → partial sync → missing CSS).
 */
const fs = require("node:fs");
const path = require("node:path");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFileRobust(from, to) {
  ensureDir(path.dirname(to));
  try {
    fs.copyFileSync(from, to);
  } catch {
    // Locked destination: write temp then replace
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

function mirrorDir(src, dest, stats) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  const seen = new Set();

  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    seen.add(entry.name);
    if (entry.isDirectory()) {
      mirrorDir(from, to, stats);
    } else {
      copyFileRobust(from, to);
      stats.files += 1;
      if (entry.name.endsWith(".css")) stats.css += 1;
    }
  }

  // Remove stale files/dirs in dest that are not in src (best-effort)
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
 * @returns {{ ok: boolean, files: number, css: number, removed: number, error?: string }}
 */
function syncNextStatic(root) {
  const src = path.join(root, ".next", "static");
  const dest = path.join(root, "_next", "static");
  const stats = { files: 0, css: 0, removed: 0 };

  if (!fs.existsSync(src)) {
    return { ok: false, ...stats, error: "missing .next/static" };
  }

  try {
    mirrorDir(src, dest, stats);
    return { ok: true, ...stats };
  } catch (err) {
    return {
      ok: false,
      ...stats,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

module.exports = { syncNextStatic };
