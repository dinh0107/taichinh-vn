/**
 * Serve /_next/static/* from disk (IIS + iisnode).
 * Next's own handler often returns HTTP 500 for CSS over named pipes;
 * IIS physical rewrite also fails when APPL_PHYSICAL_PATH has no trailing slash.
 * Reading .next/static (then _next/static) directly is the reliable path.
 */
const fs = require("node:fs");
const path = require("node:path");
const { syncNextStatic } = require("./sync-next-static");

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function safeRelPath(urlPath) {
  const prefix = "/_next/static/";
  if (!urlPath.startsWith(prefix)) return null;
  let rel = decodeURIComponent(urlPath.slice(prefix.length));
  if (!rel || rel.includes("\0")) return null;
  rel = rel.replace(/^[/\\]+/, "").replace(/\\/g, "/");
  const parts = rel.split("/");
  if (parts.some((p) => p === ".." || p === "")) return null;
  return parts.join(path.sep);
}

function tryReadFile(filePath) {
  try {
    const st = fs.statSync(filePath);
    if (!st.isFile()) return null;
    return fs.readFileSync(filePath);
  } catch {
    return null;
  }
}

/**
 * @param {import("node:http").IncomingMessage} req
 * @param {import("node:http").ServerResponse} res
 * @param {string} root project root
 * @param {string} pathname parsed pathname (no query)
 * @returns {boolean} true if this request was handled
 */
function serveNextStatic(req, res, root, pathname) {
  if (!pathname.startsWith("/_next/static/")) return false;

  const rel = safeRelPath(pathname);
  if (!rel) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return true;
  }

  const candidates = [
    path.join(root, ".next", "static", rel),
    path.join(root, "_next", "static", rel),
  ];

  let data = null;
  let used = null;
  for (const filePath of candidates) {
    data = tryReadFile(filePath);
    if (data) {
      used = filePath;
      break;
    }
  }

  // Race after deploy: HTML from new build, sync incomplete — retry sync once
  if (!data) {
    const synced = syncNextStatic(root);
    if (synced.ok) {
      for (const filePath of candidates) {
        data = tryReadFile(filePath);
        if (data) {
          used = filePath;
          break;
        }
      }
    }
  }

  if (!data) {
    console.warn("[serve-next-static] 404", pathname);
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end("Not Found");
    return true;
  }

  const ext = path.extname(used).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": data.length,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(data);
  return true;
}

module.exports = { serveNextStatic };
