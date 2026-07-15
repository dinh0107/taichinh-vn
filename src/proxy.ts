import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isArticleDetailPath,
  stripHtmlExtension,
} from "@/lib/seo/html-path";

/**
 * Edge proxy for public URLs.
 *
 * CRITICAL: never return NextResponse.redirect / 3xx here.
 * Redirects loop with custom servers / IIS and cause "redirect during render"
 * noise in the browser. Article `.html` URLs are handled by rewrite only:
 *
 *   /tin-tuc/slug.html → rewrite → /tin-tuc/slug
 *   /tin-tuc.html      → rewrite → /tin-tuc
 *   /tin-tuc/slug      → pass through
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Never redirect POST / Server Actions
  if (
    request.headers.has("next-action") ||
    (method !== "GET" && method !== "HEAD")
  ) {
    return NextResponse.next();
  }

  // Strip trailing slash via rewrite (not 308) so render URL stays stable.
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "") || "/";
    return NextResponse.rewrite(url);
  }

  if (/^\/tin-tuc\.html$/i.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/tin-tuc";
    return NextResponse.rewrite(url);
  }

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
