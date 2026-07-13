import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isArticleDetailPath,
  stripHtmlExtension,
  withHtmlExtension,
} from "@/lib/seo/html-path";

/**
 * Only article detail pages use `.html`:
 *   /tin-tuc/slug → 308 → /tin-tuc/slug.html
 *   /tin-tuc/slug.html → rewrite → /tin-tuc/slug
 * Listing `/tin-tuc` stays extensionless (never redirect to .html).
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

  // Listing: /tin-tuc.html → rewrite /tin-tuc (no redirect — avoids loops)
  if (/^\/tin-tuc\.html$/i.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/tin-tuc";
    return NextResponse.rewrite(url);
  }

  // Never touch the news listing
  if (pathname === "/tin-tuc" || pathname === "/tin-tuc/") {
    return NextResponse.next();
  }

  // /tin-tuc/slug.html → rewrite → /tin-tuc/slug
  if (/\.html$/i.test(pathname) && isArticleDetailPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = stripHtmlExtension(pathname);
    return NextResponse.rewrite(url);
  }

  // /tin-tuc/slug → 308 → /tin-tuc/slug.html
  if (isArticleDetailPath(pathname) && !/\.html$/i.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = withHtmlExtension(pathname);
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/brand|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?|txt|xml)$).*)",
  ],
};
