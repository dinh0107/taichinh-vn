import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isArticleDetailPath,
  stripHtmlExtension,
} from "@/lib/seo/html-path";

/**
 * Public article URLs may end with `.html`.
 * Only rewrite — never 308 to `.html` (redirects loop with custom servers / IIS).
 *
 *   /tin-tuc/slug.html → rewrite → /tin-tuc/slug
 *   /tin-tuc.html      → rewrite → /tin-tuc
 *   /tin-tuc/slug      → pass through (also valid)
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
