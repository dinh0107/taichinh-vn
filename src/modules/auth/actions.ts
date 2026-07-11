"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import {
  verifyCredentials,
  createSession,
  destroySession,
  isAdminRole,
} from "@/lib/auth";

export type LoginState = {
  error?: string;
  redirectTo?: string;
};

const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  next: z.string().optional(),
});

function safeNext(next?: string): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/admin";
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    next: formData.get("next") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const { email, password, next } = parsed.data;

  try {
    const user = await verifyCredentials(email, password);
    if (!user) {
      return { error: "Email hoặc mật khẩu không đúng." };
    }
    if (!isAdminRole(user.role)) {
      return { error: "Tài khoản không có quyền truy cập quản trị." };
    }
    await createSession(user.id);
  } catch (e) {
    logger.error({ e }, "Login failed");
    return { error: "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại." };
  }

  // Return path for client navigation (more reliable than redirect()
  // with useActionState on some hosts / Next versions).
  return { redirectTo: safeNext(next) };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/dang-nhap");
}
