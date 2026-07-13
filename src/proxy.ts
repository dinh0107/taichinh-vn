import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isHtmlExemptPath,
  stripHtmlExtension,
  withHtmlExtension,
} from "@/lib/seo/html-path";

const ACCESS_COOKIE = "tcvn_admin_access";
const REFRESH_COOKIE = "tcvn_admin_refresh";
const LEGACY_SESSION_COOKIE = "tcvn_admin_session";

/**
 * Next.js 16: single `proxy.ts` (middleware convention is deprecated).
 * - Admin: cookie gate
 * - Public: force `.html` URLs (rewrite inbound / 308 outbound)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Server Actions POSTs must not be redirected — requireAdmin() still applies.
  const isServerAction = request.headers.has("next-action");

  if (
    pathname.startsWith("/_next") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Admin auth gate
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isServerAction) {
      const hasSession = Boolean(
        request.cookies.get(ACCESS_COOKIE)?.value ||
          request.cookies.get(REFRESH_COOKIE)?.value ||
          request.cookies.get(LEGACY_SESSION_COOKIE)?.value
      );

      if (!hasSession) {
        const loginUrl = new URL("/dang-nhap", request.url);
        loginUrl.searchParams.set("next", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  }

  // /foo.html → rewrite → /foo (App Router path) — keep for RSC navigations
  if (/\.html$/i.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = stripHtmlExtension(pathname);
    return NextResponse.rewrite(url);
  }

  // /foo → 308 → /foo.html (skip Server Actions)
  if (
    !isServerAction &&
    !isHtmlExemptPath(pathname) &&
    !pathname.includes(".")
  ) {
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
