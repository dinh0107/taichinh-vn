/**
 * Plesk / iisnode startup file.
 * Application Startup File = app.js
 *
 * iisnode sets PORT to a named pipe (e.g. \\.\pipe\...).
 * Do NOT Number(PORT) or listen on 127.0.0.1:3000 — that causes EACCES.
 */
const { createServer } = require("node:http");
const { parse } = require("node:url");
const path = require("node:path");
const next = require("next");
const { syncNextStatic } = require("./scripts/sync-next-static");

const dir = __dirname;
const dev = process.env.NODE_ENV === "development";
const port = process.env.PORT || 3000;
const isPipe = typeof port === "string" && String(port).includes("pipe");

function syncNextStaticForIis() {
  if (dev) return;
  const result = syncNextStatic(dir);
  if (!result.ok) {
    console.warn("[app.js] _next sync failed:", result.error);
    return;
  }
  console.log(
    `[app.js] Synced .next/static → _next/static (${result.files} files, ${result.css} css)`
  );
  if (result.css < 1) {
    console.warn("[app.js] WARNING: no CSS in _next/static — UI will look broken");
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
