"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Menu,
  X,
  Coins,
  DollarSign,
  Landmark,
  Fuel,
  Newspaper,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type MegaLink = { label: string; href: string };

export type MegaNavItem = {
  href: string;
  label: string;
  icon: typeof Coins;
  groups?: { title: string; links: MegaLink[] }[];
};

export const MEGA_NAV: MegaNavItem[] = [
  {
    href: "/gia-vang",
    label: "Giá vàng",
    icon: Coins,
    groups: [
      {
        title: "Giá vàng trong nước",
        links: [
          { label: "SJC", href: "/gia-vang-sjc-hom-nay" },
          { label: "DOJI", href: "/gia-vang-doji-hom-nay" },
          { label: "PNJ", href: "/gia-vang-pnj-hom-nay" },
          { label: "Bảo Tín Minh Châu", href: "/gia-vang-bao-tin-hom-nay" },
          { label: "Mi Hồng", href: "/gia-vang" },
          { label: "Ngọc Thẩm", href: "/gia-vang" },
          { label: "Tất cả giá vàng", href: "/gia-vang" },
        ],
      },
      {
        title: "Giá vàng quốc tế",
        links: [{ label: "Thế giới", href: "/gia-vang-the-gioi-hom-nay" }],
      },
    ],
  },
  {
    href: "/ty-gia",
    label: "Tỷ giá ngân hàng",
    icon: DollarSign,
    groups: [
      {
        title: "Tỷ giá ngân hàng",
        links: [
          { label: "USD", href: "/ty-gia-usd-hom-nay" },
          { label: "EUR", href: "/ty-gia-eur-hom-nay" },
          { label: "GBP", href: "/ty-gia-gbp-hom-nay" },
          { label: "JPY", href: "/ty-gia-jpy-hom-nay" },
          { label: "CNY", href: "/ty-gia-cny-hom-nay" },
          { label: "Tất cả tỷ giá", href: "/ty-gia" },
        ],
      },
    ],
  },
  {
    href: "/lai-suat",
    label: "Lãi suất",
    icon: Landmark,
    groups: [
      {
        title: "Lãi suất ngân hàng",
        links: [
          { label: "Vietcombank", href: "/lai-suat-vietcombank" },
          { label: "BIDV", href: "/lai-suat-bidv" },
          { label: "Techcombank", href: "/lai-suat-techcombank" },
          { label: "VPBank", href: "/lai-suat-vpbank" },
          { label: "So sánh lãi suất", href: "/lai-suat" },
        ],
      },
    ],
  },
  {
    href: "/lai-suat",
    label: "Công cụ",
    icon: Wrench,
    groups: [
      {
        title: "Công cụ",
        links: [
          { label: "So sánh lãi suất ngân hàng", href: "/lai-suat" },
        ],
      },
    ],
  },
  {
    href: "/gia-xang",
    label: "Xăng dầu",
    icon: Fuel,
    groups: [
      {
        title: "Giá xăng dầu",
        links: [
          { label: "Trong nước", href: "/gia-xang" },
          { label: "RON95", href: "/gia-xang-ron95-hom-nay" },
          { label: "E5", href: "/gia-xang-e5-hom-nay" },
          { label: "Diesel", href: "/gia-xang-diesel-hom-nay" },
        ],
      },
    ],
  },
  {
    href: "/chung-khoan",
    label: "Chứng khoán",
    icon: TrendingUp,
    groups: [
      {
        title: "Chỉ số",
        links: [
          { label: "VN-Index", href: "/chung-khoan-vnindex" },
          { label: "HNX-Index", href: "/chung-khoan-hnxindex" },
          { label: "UPCOM", href: "/chung-khoan-upcom" },
          { label: "Thị trường", href: "/chung-khoan" },
        ],
      },
    ],
  },
  {
    href: "/tin-tuc",
    label: "Tin tức",
    icon: Newspaper,
    groups: [
      {
        title: "Chuyên mục tin",
        links: [
          { label: "Giá vàng", href: "/tin-tuc" },
          { label: "Xăng dầu", href: "/tin-tuc" },
        ],
      },
    ],
  },
];

function DesktopMegaItem({ item }: { item: MegaNavItem }) {
  const pathname = usePathname();
  const active =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={cn(
          "group relative flex h-8 items-center gap-[5px] rounded-full px-1 transition-colors",
          open || active
            ? "bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.96)]"
            : "text-[rgba(255,255,255,0.72)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.96)]"
        )}
      >
        <Link
          href={item.href}
          className="inline-flex h-7 items-center whitespace-nowrap rounded-full px-1 text-[13px] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#050816]"
        >
          {item.label}
        </Link>
        {item.groups && (
          <span className="inline-flex h-7 w-3 items-center justify-center text-[rgba(255,255,255,0.45)] group-hover:text-[rgba(255,255,255,0.96)]">
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </span>
        )}
      </div>

      {item.groups && open && (
        <div className="absolute left-0 top-full z-50 pt-3">
          <div className="inline-block max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border-soft)] bg-white/95 p-5 shadow-[var(--shadow-dropdown)] backdrop-blur-2xl">
            <div
              className={cn(
                "grid gap-3",
                item.groups.length > 1
                  ? "grid-cols-2"
                  : "grid-cols-1"
              )}
              style={
                item.groups.length > 1
                  ? {
                      gridTemplateColumns:
                        "minmax(190px, 240px) minmax(190px, 240px)",
                    }
                  : { gridTemplateColumns: "minmax(190px, 260px)" }
              }
            >
              {item.groups.map((g) => (
                <section
                  key={g.title}
                  className="rounded-2xl border border-slate-100 bg-white/70 p-3"
                >
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {g.title}
                  </p>
                  <ul className="space-y-1.5">
                    {g.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link
                          href={l.href}
                          className="group flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-[var(--text-primary)] transition hover:bg-slate-100/70"
                        >
                          <span className="truncate">{l.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteNavDesktop() {
  return (
    <nav
      aria-label="Menu chính"
      className="flex items-center justify-start gap-0.5"
    >
      {MEGA_NAV.map((item) => (
        <DesktopMegaItem key={item.label + item.href} item={item} />
      ))}
    </nav>
  );
}

export function SiteNavMobile() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white lg:hidden"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[min(100%,340px)] flex-col bg-[#050816] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-bold">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {MEGA_NAV.map((item) => {
                const isOpen = expanded === item.label;
                return (
                  <div key={item.label} className="border-b border-white/10">
                    <div className="flex items-center gap-1">
                      <Link
                        href={item.href}
                        className="flex flex-1 items-center gap-2 px-2 py-3 text-sm font-semibold text-white"
                      >
                        <item.icon className="h-4 w-4 text-blue-400" />
                        {item.label}
                      </Link>
                      {item.groups && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded(isOpen ? null : item.label)
                          }
                          className="rounded-lg p-2 text-white/60 hover:bg-white/10"
                          aria-label={`Mở ${item.label}`}
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>
                      )}
                    </div>
                    {item.groups && isOpen && (
                      <div className="space-y-3 pb-3 pl-8 pr-2">
                        {item.groups.map((g) => (
                          <div key={g.title}>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-white/40">
                              {g.title}
                            </p>
                            <ul className="space-y-0.5">
                              {g.links.map((l) => (
                                <li key={l.href + l.label}>
                                  <Link
                                    href={l.href}
                                    className="block rounded-md px-2 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                                  >
                                    {l.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
