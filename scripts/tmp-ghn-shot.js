const { chromium } = require("playwright");
const path = require("path");
const out = process.env.TEMP || "/tmp";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("https://giahomnay.vn/", { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({ path: path.join(out, "ghn-home-top.png"), fullPage: false });
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, "ghn-home-mid.png"), fullPage: false });
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, "ghn-home-lower.png"), fullPage: false });
  await page.screenshot({ path: path.join(out, "ghn-home-full.png"), fullPage: true });
  // hover nav
  await page.evaluate(() => window.scrollTo(0, 0));
  const goldNav = page.locator("header a", { hasText: /^Giá vàng$/ }).first();
  await goldNav.hover();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "ghn-mega.png"), fullPage: false });
  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
