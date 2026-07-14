/**
 * Only article detail URLs use a `.html` suffix:
 *   /tin-tuc/gia-vang-tang.html  ✅
 *   /tin-tuc                    ❌ (listing — no .html)
 *   /gia-vang                   ❌
 */

const EXEMPT_PREFIXES = ["/admin", "/api", "/dang-nhap", "/_next"];

/** `/tin-tuc/{slug}` (not the listing `/tin-tuc`). */
export function isArticleDetailPath(path: string): boolean {
  let p = path.startsWith("/") ? path : `/${path}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  p = p.replace(/\.html$/i, "");
  if (p === "/tin-tuc") return false;
  return /^\/tin-tuc\/[^/]+$/.test(p);
}

export function isHtmlExemptPath(path: string): boolean {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/" || p === "") return true;
  return EXEMPT_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`)
  );
}

/** Public URL path — adds `.html` only for article detail pages. */
export function withHtmlExtension(path: string): string {
  if (!path || path === "/") return path || "/";

  let p = path.startsWith("/") ? path : `/${path}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);

  if (isHtmlExemptPath(p)) return p;
  if (/\.html$/i.test(p)) return p;
  if (!isArticleDetailPath(p)) return p;

  return `${p}.html`;
}

/** Strip trailing `.html` for App Router / revalidatePath. */
export function stripHtmlExtension(path: string): string {
  if (!path || path === "/") return path || "/";
  return path.replace(/\.html$/i, "") || "/";
}
