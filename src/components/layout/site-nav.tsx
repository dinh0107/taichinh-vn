"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteNav({
  items,
  variant = "desktop",
}: {
  items: { href: string; label: string; icon: LucideIcon }[];
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav className="flex items-center gap-0 overflow-x-auto border-t border-white/5 bg-finance-900/50 px-2 py-1.5 no-scrollbar lg:hidden">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                active
                  ? "border-b-2 border-gold-500 text-gold-400"
                  : "text-finance-400 hover:text-white"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="hidden items-center lg:flex">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-colors",
              active
                ? "text-gold-400"
                : "text-finance-300 hover:text-white"
            )}
          >
            <item.icon className="h-3.5 w-3.5 opacity-70" />
            {item.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-[9px] h-px bg-gold-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
