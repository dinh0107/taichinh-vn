/**
 * Plesk / iisnode startup file.
 * Application Startup File = app.js
 *
 * iisnode sets PORT to a named pipe (e.g. \\.\pipe\...).
 * Do NOT Number(PORT) or listen on 127.0.0.1:3000 — that causes EACCES.
 */
const { createServer } = require("node:http");
const { parse } = require("node:url");
const fs = require("node:fs");
const path = require("node:path");
const next = require("next");

const dir = __dirname;
const dev = process.env.NODE_ENV === "development";
const port = process.env.PORT || 3000;
const isPipe = typeof port === "string" && String(port).includes("pipe");

/** Keep IIS physical `_next/static` in sync with `.next/static` (avoids unstyled UI). */
function syncNextStaticForIis() {
  if (dev) return;
  const src = path.join(dir, ".next", "static");
  const destRoot = path.join(dir, "_next");
  const dest = path.join(destRoot, "static");
  if (!fs.existsSync(src)) {
    console.warn("[app.js] .next/static missing — skip _next sync");
    return;
  }
  function copyDir(from, to) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      const a = path.join(from, entry.name);
      const b = path.join(to, entry.name);
      if (entry.isDirectory()) copyDir(a, b);
      else fs.copyFileSync(a, b);
    }
  }
  try {
    fs.rmSync(destRoot, { recursive: true, force: true });
    copyDir(src, dest);
    console.log("[app.js] Synced .next/static → _next/static");
  } catch (err) {
    console.warn("[app.js] _next sync failed:", err.message);
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
