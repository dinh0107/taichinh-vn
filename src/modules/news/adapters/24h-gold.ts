import * as cheerio from "cheerio";

const LIST_URL = "https://www.24h.com.vn/gia-vang-c161e3047.html";
const SOURCE_NAME = "24h.com.vn";
const USER_AGENT =
  "Mozilla/5.0 (compatible; GiaHomNayBot/1.0; +https://giahomnay.site)";

export type ScrapedListItem = {
  url: string;
  title?: string;
};

export type ScrapedArticle = {
  url: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  image: string | null;
};

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "vi-VN,vi;q=0.9",
    },
    signal: AbortSignal.timeout(45_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function absolutize(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://www.24h.com.vn${url}`;
  return url;
}

function meta($: cheerio.CheerioAPI, prop: string): string {
  const a = $(`meta[property="${prop}"]`).attr("content");
  const b = $(`meta[name="${prop}"]`).attr("content");
  return (a || b || "").trim();
}

function stripJunk($: cheerio.CheerioAPI, rootSel: string) {
  $(rootSel)
    .find(
      [
        "script",
        "style",
        "iframe",
        "noscript",
        "nav",
        ".btn-kd-social",
        ".cate-24h-foot-arti-deta-social",
        ".cate-24h-foot-arti-deta-tags",
        ".baiviet-bailienquan",
        ".boxDuba",
        ".ads",
        "[class*='banner']",
        "[id*='ads']",
        ".fb-like",
        ".zalo-share-button",
      ].join(",")
    )
    .remove();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Listing page → article URLs in GOLD category (c161a…). */
export async function fetch24hGoldList(
  limit = 12
): Promise<ScrapedListItem[]> {
  const html = await fetchHtml(LIST_URL);
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const out: ScrapedListItem[] = [];

  $("a[href]").each((_, el) => {
    const href = absolutize($(el).attr("href") || "");
    if (!/www\.24h\.com\.vn\/.+c161a\d+\.html/i.test(href)) return;
    if (!/\/kinh-doanh\//i.test(href)) return;
    const clean = href.split("#")[0];
    if (seen.has(clean)) return;
    seen.add(clean);
    const title = $(el).text().replace(/\s+/g, " ").trim();
    out.push({ url: clean, title: title || undefined });
  });

  return out.slice(0, limit);
}

export async function fetch24hArticle(url: string): Promise<ScrapedArticle> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const title =
    meta($, "og:title") ||
    $("#article_title").first().text().replace(/\s+/g, " ").trim();
  if (!title) throw new Error(`No title for ${url}`);

  const excerpt =
    meta($, "og:description") ||
    $(".sapo, .cate-24h-foot-arti-deta-sapo")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();

  const imageRaw = meta($, "og:image");
  const image = imageRaw ? absolutize(imageRaw) : null;

  if (!$("#article_body").length) {
    throw new Error(`No #article_body for ${url}`);
  }

  stripJunk($, "#article_body");
  $("#article_body header").remove();

  $("#article_body a").each((_, a) => {
    const href = $(a).attr("href");
    if (href) $(a).attr("href", absolutize(href));
    $(a).attr("rel", "nofollow noopener noreferrer");
    $(a).attr("target", "_blank");
  });
  $("#article_body img").each((_, img) => {
    const src = $(img).attr("src") || $(img).attr("data-src");
    if (src) {
      $(img).attr("src", absolutize(src));
      $(img).attr("loading", "lazy");
    }
  });

  let contentHtml = $("#article_body").html()?.trim() || "";
  if (contentHtml.replace(/<[^>]+>/g, "").trim().length < 40) {
    const paras = $("#article_body p")
      .toArray()
      .map((p) => $(p).text().replace(/\s+/g, " ").trim())
      .filter((t) => t.length > 20);
    contentHtml = paras.map((t) => `<p>${escapeHtml(t)}</p>`).join("\n");
  }

  const attribution = `<p class="source-attr"><em>Nguồn: <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer nofollow">${SOURCE_NAME}</a>. Nội dung được tổng hợp tự động phục vụ cập nhật thị trường.</em></p>`;
  contentHtml = `${contentHtml}\n${attribution}`;

  if (contentHtml.replace(/<[^>]+>/g, "").trim().length < 20) {
    throw new Error(`Content too short for ${url}`);
  }

  return {
    url,
    title,
    excerpt: excerpt.slice(0, 400),
    contentHtml,
    image,
  };
}

export { LIST_URL, SOURCE_NAME };
