const fs = require("fs");
const temp = process.env.TEMP;

function extract(file, markers) {
  const h = fs.readFileSync(`${temp}/${file}`, "utf8");
  console.log("\n====", file);
  for (const m of markers) {
    const i = h.indexOf(m);
    console.log(m, i >= 0 ? i : "MISS");
    if (i >= 0) {
      const out = `${temp}/snip-${file}-${m.slice(0, 20).replace(/\W+/g, "")}.html`;
      fs.writeFileSync(out, h.slice(Math.max(0, i - 200), i + 3500));
    }
  }
  // grid
  const g = h.match(/xl:grid-cols-\[[^\]]+\][^\"]*/);
  console.log("grid", g && g[0]);
  // body main content breadcrumbs
  const bc = h.match(/Trang chủ[\s\S]{0,400}Giá vàng|Trang chủ[\s\S]{0,400}Tỷ giá|Trang chủ[\s\S]{0,400}Xăng|Trang chủ[\s\S]{0,400}Lãi suất|Trang chủ[\s\S]{0,400}Tin tức/);
  console.log("bc snippet", bc && bc[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 200));
}

extract("ghn-gv.html", [
  "sticky top-20 hidden",
  "Giá vàng hôm nay",
  "Đồng/chỉ",
  "Giá dầu thô thế giới",
  "breadcrumb",
  "surface-card",
]);
extract("ghn-tg.html", [
  "sticky top-20 hidden",
  "Tỷ giá",
  "Vietcombank",
  "Giá dầu thô thế giới",
]);
extract("ghn-xd.html", [
  "sticky top-20 hidden",
  "Giá xăng",
  "RON",
  "Giá dầu thô thế giới",
]);
extract("ghn-ls.html", [
  "sticky top-20 hidden",
  "Lãi suất",
  "12 tháng",
  "Giá dầu thô thế giới",
]);
extract("ghn-tt.html", [
  "sticky top-20 hidden",
  "Tin tức",
  "Nổi bật",
]);
