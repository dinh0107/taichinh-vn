import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isHtmlExemptPath,
  stripHtmlExtension,
  withHtmlExtension,
} from "@/lib/seo/html-path";

/**
 * Next.js 16 proxy:
 * - Public SEO URLs: `/path` → 308 `/path.html`, rewrite back for App Router
 * - Do NOT gate /admin here (IIS/iisnode often drops cookies at the proxy layer
 *   on Server Action follow-up navigations → false redirects to login).
 *   Auth stays in admin layout + requireAdmin() in Server Actions.
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

  // Never redirect POST/PUT/etc or Server Actions (breaks form saves).
  if (isServerAction || (method !== "GET" && method !== "HEAD")) {
    return NextResponse.next();
  }

  // Admin / login / auth pages — leave alone
  if (isHtmlExemptPath(pathname)) {
    return NextResponse.next();
  }

  // /foo.html → rewrite → /foo
  if (/\.html$/i.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = stripHtmlExtension(pathname);
    return NextResponse.rewrite(url);
  }

  // /foo → 308 → /foo.html
  if (!pathname.includes(".")) {
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
