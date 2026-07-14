const fs = require("fs");
const https = require("https");
const temp = process.env.TEMP;

function get(url) {
  return new Promise((resolve) => {
    https
      .get(url, { headers: { Accept: "application/json" } }, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () =>
          resolve({ status: res.statusCode, body: d.slice(0, 400) })
        );
      })
      .on("error", (e) => resolve({ status: 0, body: e.message }));
  });
}

(async () => {
  const h = fs.readFileSync(temp + "/ghn-xd.html", "utf8");
  const apis = [...h.matchAll(/\/api\/[a-zA-Z0-9_./?-]+/g)].map((m) => m[0]);
  console.log("from html:", [...new Set(apis)].join("\n"));

  const candidates = [
    "/api/widgets/xang-dau/petrolimex",
    "/api/widgets/xang-dau/the-gioi",
    "/api/widgets/xang-dau/world",
    "/api/widgets/xang-dau/wti",
    "/api/widgets/xang-dau/brent",
    "/api/widgets/dau-tho",
    "/api/widgets/dau-tho/wti",
    "/api/widgets/dau-tho/brent",
    "/api/widgets/nang-luong/wti",
    "/api/widgets/oil/wti",
    "/api/widgets/xang-dau/petrolimex/history",
    "/api/widgets/xang-dau/petrolimex?rowKey=xang-ron-95-v",
    "/api/widgets/xang-dau/petrolimex/xang-ron-95-v",
    "/api/widgets/xang-dau/petrolimex/chart",
    "/api/widgets/series/xang-dau/petrolimex",
  ];

  for (const path of candidates) {
    const r = await get("https://giahomnay.vn" + path);
    const ok = r.status === 200 && r.body.trim().startsWith("{");
    console.log(r.status, ok ? "JSON" : "no", path);
    if (ok) console.log("  ", r.body.slice(0, 180));
  }
})();
