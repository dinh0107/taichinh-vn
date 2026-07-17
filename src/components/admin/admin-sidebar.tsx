"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  FileText,
  Search,
  Megaphone,
  Clock,
  Settings,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/du-lieu", label: "Dữ liệu", icon: Database },
  { href: "/admin/bai-viet", label: "Bài viết", icon: FileText },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/quang-cao", label: "Quảng cáo", icon: Megaphone },
  { href: "/admin/cron", label: "Cron & Logs", icon: Clock },
  { href: "/admin/cai-dat", label: "Cài đặt", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-extrabold text-slate-900">
          T
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Giá Hôm Nay</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Admin Panel
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-amber-500/10 text-amber-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <ExternalLink className="h-4.5 w-4.5" />
          Xem trang web
        </Link>
      </div>
    </aside>
  );
}
