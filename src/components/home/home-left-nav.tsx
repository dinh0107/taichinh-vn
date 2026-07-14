"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Coins,
  Fuel,
  DollarSign,
  Landmark,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MARKET_LINKS: {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
}[] = [
  { href: "/", label: "Tổng quan", icon: Home, exact: true },
  { href: "/gia-vang", label: "Giá vàng", icon: Coins },
  { href: "/gia-xang", label: "Xăng dầu", icon: Fuel },
  { href: "/ty-gia", label: "Tỷ giá", icon: DollarSign },
  { href: "/lai-suat", label: "Lãi suất", icon: Landmark },
];

export function HomeLeftNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] self-start flex-col overflow-y-auto rounded-2xl border border-[var(--border-soft)] bg-white/92 p-3.5 shadow-[var(--shadow-soft)] backdrop-blur-xl xl:flex">
      <div>
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
          Thị trường
        </p>
        <nav className="mt-3 space-y-1.5" aria-label="Thị trường">
          {MARKET_LINKS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-xl border px-3 text-sm font-medium transition duration-[250ms]",
                  active
                    ? "border-blue-600/25 bg-blue-600/8 text-blue-600"
                    : "border-transparent text-[#02050e] hover:border-blue-600/20 hover:bg-blue-600/5 hover:text-blue-600"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-lg border bg-white",
                    active
                      ? "border-blue-600/25 text-blue-600"
                      : "border-[var(--border-soft)] text-[#6b7280] group-hover:border-blue-600/20 group-hover:text-blue-600"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <nav className="mt-4 border-t border-[var(--border-soft)] pt-4" aria-label="Tin tức">
        <Link
          href="/tin-tuc"
          className={cn(
            "group flex h-10 items-center gap-3 rounded-xl border px-3 text-sm font-medium transition duration-[250ms]",
            pathname.startsWith("/tin-tuc")
              ? "border-blue-600/25 bg-blue-600/8 text-blue-600"
              : "border-transparent text-[#02050e] hover:border-blue-600/20 hover:bg-blue-600/5 hover:text-blue-600"
          )}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-white text-[#6b7280] group-hover:border-blue-600/20 group-hover:text-blue-600">
            <Newspaper className="h-[18px] w-[18px] shrink-0" />
          </span>
          <span>Tin tức</span>
        </Link>
      </nav>

      <div className="mt-auto rounded-2xl border border-[var(--border-soft)] bg-slate-50 p-4">
        <p className="text-sm font-semibold text-[#02050e]">Theo dõi realtime</p>
        <p className="mt-2 text-xs leading-5 text-[#6b7280]">
          Giá vàng, tỷ giá và năng lượng được gom vào một dashboard gọn để quét
          nhanh trong ngày.
        </p>
      </div>
    </aside>
  );
}
