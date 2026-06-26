import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import type { User, UserRole } from "@prisma/client";

export const SESSION_COOKIE = "tcvn_admin_session";
const SESSION_TTL_DAYS = 7;
const ADMIN_ROLES: UserRole[] = ["ADMIN", "EDITOR"];

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "image">;

function sessionExpiry(): Date {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
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
  const token = randomBytes(32).toString("hex");
  const expiresAt = sessionExpiry();

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Delete the current session from DB and clear the cookie. Call from a Server Action. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  store.delete(SESSION_COOKIE);
}

/** Read the current authenticated user from the session cookie, or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

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
