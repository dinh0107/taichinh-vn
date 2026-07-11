import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import type { User, UserRole } from "@prisma/client";

export const ACCESS_COOKIE = "tcvn_admin_access";
export const REFRESH_COOKIE = "tcvn_admin_refresh";
export const LEGACY_SESSION_COOKIE = "tcvn_admin_session";
const ACCESS_TTL_MINUTES = 15;
const SESSION_TTL_DAYS = 7;
const ADMIN_ROLES: UserRole[] = ["ADMIN", "EDITOR"];

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "image">;

function sessionExpiry(): Date {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}

function accessExpiry(): Date {
  return new Date(Date.now() + ACCESS_TTL_MINUTES * 60 * 1000);
}

function cookieSecure(): boolean {
  // Must be false on plain HTTP — otherwise browser drops the session cookie
  // and login appears to "succeed" without navigating to /admin.
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return appUrl.startsWith("https://");
}

function sessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.CRON_SECRET ||
    "change-me-admin-session-secret"
  );
}


function encodeAccessToken(payload: { userId: string; exp: number }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function decodeAccessToken(
  token: string
): { userId: string; exp: number } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", sessionSecret())
    .update(body)
    .digest("base64url");

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      userId?: string;
      exp?: number;
    };
    if (!payload.userId || !payload.exp || payload.exp * 1000 < Date.now()) {
      return null;
    }
    return { userId: payload.userId, exp: payload.exp };
  } catch {
    return null;
  }
}

async function getUserById(userId: string): Promise<SessionUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, image: true },
  });
}

async function getUserFromRefreshToken(token: string): Promise<SessionUser | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true, image: true },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.deleteMany({ where: { token } });
    return null;
  }
  return session.user;
}

/** Verify email + password against the User table. Returns the user or null. */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user || !user.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

/** Create a DB-backed session and set the httpOnly cookie. Call from a Server Action. */
export async function createSession(userId: string): Promise<void> {
  const refreshToken = randomBytes(32).toString("hex");
  const refreshExpiresAt = sessionExpiry();
  const accessExpiresAt = accessExpiry();
  const accessToken = encodeAccessToken({
    userId,
    exp: Math.floor(accessExpiresAt.getTime() / 1000),
  });

  await prisma.session.create({
    data: { userId, token: refreshToken, expiresAt: refreshExpiresAt },
  });

  const store = await cookies();
  const secure = cookieSecure();
  store.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: accessExpiresAt,
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: refreshExpiresAt,
  });
  store.delete(LEGACY_SESSION_COOKIE);
}

/** Delete the current session from DB and clear the cookie. Call from a Server Action. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  const legacyToken = store.get(LEGACY_SESSION_COOKIE)?.value;
  const token = refreshToken || legacyToken;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(LEGACY_SESSION_COOKIE);
}

/** Read the current authenticated user from the session cookie, or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken =
    store.get(REFRESH_COOKIE)?.value || store.get(LEGACY_SESSION_COOKIE)?.value;

  const accessPayload = accessToken ? decodeAccessToken(accessToken) : null;
  if (accessPayload) {
    const user = await getUserById(accessPayload.userId);
    if (user) return user;
  }

  if (!refreshToken) return null;
  return getUserFromRefreshToken(refreshToken);
}

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Authoritative guard for admin areas. Redirects to /dang-nhap when the user is
 * not signed in or lacks an admin/editor role. Returns the user otherwise.
 */
export async function requireAdmin(redirectTo = "/admin"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    redirect(`/dang-nhap?next=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}
