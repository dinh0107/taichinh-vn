import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser, isAdminRole } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Đăng nhập quản trị" },
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/admin";

  const user = await getCurrentUser();
  if (user && isAdminRole(user.role)) {
    redirect(safeNext);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 bg-gold-radial px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-xl font-extrabold text-slate-900">
            T
          </div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-white">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            Quản trị viên
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Đăng nhập để truy cập bảng điều khiển
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
          <LoginForm next={safeNext} />
        </div>
      </div>
    </div>
  );
}
