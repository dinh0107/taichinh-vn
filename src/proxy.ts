import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "tcvn_admin_access";
const REFRESH_COOKIE = "tcvn_admin_refresh";
const LEGACY_SESSION_COOKIE = "tcvn_admin_session";

/**
 * Lightweight gate for the admin area: if there's no session cookie, redirect to
 * the login page. The authoritative role check happens in the admin layout and in
 * each Server Action (defense in depth).
 */
export function proxy(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
