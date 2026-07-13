import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isArticleDetailPath,
  stripHtmlExtension,
} from "@/lib/seo/html-path";

/**
 * Article detail: rewrite `.html` → App Router path only.
 * Do NOT 308 extensionless → `.html` here — `app.js` already strips `.html`
 * before Next runs; redirecting again causes an infinite loop:
 *   /slug.html → app.js strip → /slug → proxy 308 → /slug.html → …
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const isServerAction = request.headers.has("next-action");

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (isServerAction || (method !== "GET" && method !== "HEAD")) {
    return NextResponse.next();
  }

  // /tin-tuc.html → listing
  if (/^\/tin-tuc\.html$/i.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/tin-tuc";
    return NextResponse.rewrite(url);
  }

  // /tin-tuc/slug.html → /tin-tuc/slug (when request still has .html)
  if (/\.html$/i.test(pathname) && isArticleDetailPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = stripHtmlExtension(pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/brand|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?|txt|xml)$).*)",
  ],
};
