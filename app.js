/**
 * Plesk / iisnode startup file.
 * Application Startup File = app.js
 *
 * iisnode sets PORT to a named pipe (e.g. \\.\pipe\...).
 * Do NOT Number(PORT) or listen on 127.0.0.1:3000 — that causes EACCES.
 *
 * /_next/static is served from disk here (not via Next.handle) because
 * Next returns HTTP 500 for CSS over iisnode named pipes.
 */
const { createServer } = require("node:http");
const { parse } = require("node:url");
const path = require("node:path");
const fs = require("node:fs");
const next = require("next");
const { syncNextStatic } = require("./scripts/sync-next-static");
const { serveNextStatic } = require("./scripts/serve-next-static");

const dir = __dirname;
const dev = process.env.NODE_ENV === "development";
const port = process.env.PORT || 3000;
const isPipe = typeof port === "string" && String(port).includes("pipe");

function countCss(root) {
  const base = path.join(root, ".next", "static");
  if (!fs.existsSync(base)) return 0;
  let n = 0;
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith(".css")) n += 1;
    }
  };
  walk(base);
  return n;
}

function syncNextStaticForIis() {
  if (dev) return;
  const cssBefore = countCss(dir);
  const result = syncNextStatic(dir);
  if (!result.ok) {
    console.warn("[app.js] _next sync failed:", result.error);
  } else {
    console.log(
      `[app.js] Synced .next/static → _next/static (${result.files} files, ${result.css} css)`
    );
  }
  const css = countCss(dir);
  if (css < 1) {
    console.error(
      "[app.js] FATAL: no CSS under .next/static — rebuild required (npm run build)"
    );
  } else {
    console.log(`[app.js] .next/static has ${css} css file(s) (was ${cssBefore})`);
  }
}

const app = next({
  dev,
  dir,
  ...(isPipe ? {} : { hostname: "127.0.0.1", port: Number(port) || 3000 }),
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    syncNextStaticForIis();

    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        let pathname = parsedUrl.pathname || "/";

        if (serveNextStatic(req, res, dir, pathname)) {
          return;
        }

        // iisnode custom server: Next proxy.ts often does not run.
        // Strip .html so App Router pages resolve ( /gia-vang.html → /gia-vang ).
        const htmlExempt =
          pathname === "/" ||
          pathname.startsWith("/admin") ||
          pathname.startsWith("/api") ||
          pathname.startsWith("/dang-nhap") ||
          pathname.startsWith("/_next");

        if (/\.html$/i.test(pathname) && !htmlExempt) {
          const stripped = pathname.replace(/\.html$/i, "") || "/";
          parsedUrl.pathname = stripped;
          req.url =
            stripped +
            (parsedUrl.search || "") +
            (parsedUrl.hash || "");
          pathname = stripped;
        } else if (
          !htmlExempt &&
          !pathname.includes(".") &&
          (req.method === "GET" || req.method === "HEAD") &&
          !req.headers["next-action"] &&
          req.headers["rsc"] !== "1"
        ) {
          // Optional: keep extensionless working; SEO links use .html
          // Do not 308 here — links already include .html from the app.
        }

        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error handling request", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    });

    server.listen(port, () => {
      console.log(`> Ready (${dev ? "dev" : "prod"}) dir=${dir} port=${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js", err);
    process.exit(1);
  });
