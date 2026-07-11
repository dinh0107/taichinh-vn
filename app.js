/**
 * Plesk / iisnode startup file.
 * Application Startup File = app.js
 *
 * iisnode sets PORT to a named pipe (e.g. \\.\pipe\...).
 * Do NOT Number(PORT) or listen on 127.0.0.1:3000 — that causes EACCES.
 */
const { createServer } = require("node:http");
const { parse } = require("node:url");
const next = require("next");

const dir = __dirname;
const dev = process.env.NODE_ENV === "development";
const port = process.env.PORT || 3000;
const isPipe = typeof port === "string" && String(port).includes("pipe");

const app = next({
  dev,
  dir,
  ...(isPipe ? {} : { hostname: "127.0.0.1", port: Number(port) || 3000 }),
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
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
