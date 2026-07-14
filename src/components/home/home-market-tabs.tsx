"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Tổng quan" },
  { href: "/gia-vang", label: "Giá vàng" },
  { href: "/gia-xang", label: "Xăng dầu" },
  { href: "/ty-gia", label: "Tỷ giá" },
  { href: "/lai-suat", label: "Lãi suất" },
  { href: "/tin-tuc", label: "Tin tức" },
] as const;

/** Mobile / tablet substitute for left sticky Thị trường nav */
export function HomeMarketTabs() {
  const pathname = usePathname();

  return (
    <div className="surface-card mb-5 overflow-hidden p-2 xl:hidden">
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
        <span className="shrink-0 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
          Thị trường
        </span>
        {TABS.map((t) => {
          const active =
            t.href === "/"
              ? pathname === "/"
              : pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "shrink-0 rounded-xl border px-3 py-2 text-sm font-medium transition",
                active
                  ? "border-blue-600/25 bg-blue-600/8 text-blue-600"
                  : "border-transparent text-[#02050e] hover:bg-blue-600/5 hover:text-blue-600"
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
