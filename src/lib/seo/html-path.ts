/**
 * Public URLs use a `.html` suffix (SEO / IIS-friendly).
 * App Router paths stay without `.html`; middleware rewrites inbound requests.
 */

const EXEMPT_PREFIXES = ["/admin", "/api", "/dang-nhap", "/_next"];

export function isHtmlExemptPath(path: string): boolean {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/" || p === "") return true;
  return EXEMPT_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`)
  );
}

/** Convert an internal app path to the public URL path (with `.html`). */
export function withHtmlExtension(path: string): string {
  if (!path || path === "/") return path || "/";

  let p = path.startsWith("/") ? path : `/${path}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);

  if (isHtmlExemptPath(p)) return p;
  if (/\.html$/i.test(p)) return p;

  return `${p}.html`;
}

/** Strip trailing `.html` for App Router / revalidatePath. */
export function stripHtmlExtension(path: string): string {
  if (!path || path === "/") return path || "/";
  return path.replace(/\.html$/i, "") || "/";
}
