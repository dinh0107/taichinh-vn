import type { Metadata } from "next";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/components/admin/logout-button";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_ROLE_LABELS } from "@/modules/admin/labels";
import { Bell, UserCircle } from "lucide-react";

/** Admin uses cookies/auth — always render on demand. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Admin Dashboard" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm font-bold text-slate-900 lg:hidden"
            >
              TaiChinh.vn Admin
            </Link>
            <span className="hidden text-sm text-slate-400 lg:inline">
              Bảng điều khiển quản trị
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Thông báo"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
              <UserCircle className="h-7 w-7 text-slate-400" />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {user.name ?? user.email}
                </p>
                <p className="text-[11px] text-slate-400">
                  {ADMIN_ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden no-scrollbar">
          {[
            ["/admin", "Tổng quan"],
            ["/admin/du-lieu", "Dữ liệu"],
            ["/admin/bai-viet", "Bài viết"],
            ["/admin/seo", "SEO"],
            ["/admin/quang-cao", "Quảng cáo"],
            ["/admin/cron", "Cron"],
            ["/admin/cai-dat", "Cài đặt"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              {label}
            </Link>
          ))}
        </nav>

        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
