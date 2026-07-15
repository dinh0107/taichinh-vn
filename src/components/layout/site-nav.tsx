"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MEGA_NAV,
  isMegaItemActive,
  isMegaLinkActive,
  type MegaNavItem,
} from "@/components/layout/mega-nav-data";

export type { MegaLink, MegaNavItem } from "@/components/layout/mega-nav-data";
export { MEGA_NAV } from "@/components/layout/mega-nav-data";

function DesktopMegaItem({ item }: { item: MegaNavItem }) {
  const pathname = usePathname();
  const active = isMegaItemActive(pathname, item);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasGroups = Boolean(item.groups?.length);

  function clearClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    clearClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  useEffect(() => () => clearClose(), []);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearClose();
        if (hasGroups) setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocusCapture={() => {
        clearClose();
        if (hasGroups) setOpen(true);
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          scheduleClose();
        }
      }}
    >
      <div
        className={cn(
          "group relative flex h-8 items-center gap-0.5 rounded-full px-1 transition-colors",
          open || active
            ? "bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.96)]"
            : "text-[rgba(255,255,255,0.72)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.96)]"
        )}
      >
        <Link
          href={item.href}
          className="inline-flex h-7 items-center whitespace-nowrap rounded-full px-2 text-[13px] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#050816]"
          aria-expanded={hasGroups ? open : undefined}
          aria-haspopup={hasGroups ? "menu" : undefined}
          aria-controls={hasGroups ? panelId : undefined}
        >
          {item.label}
        </Link>
        {hasGroups && (
          <button
            type="button"
            className="inline-flex h-7 w-6 items-center justify-center text-[rgba(255,255,255,0.45)] hover:text-[rgba(255,255,255,0.96)]"
            aria-label={`${open ? "Đóng" : "Mở"} menu ${item.label}`}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {hasGroups && open && item.groups && (
        <div
          id={panelId}
          role="menu"
          className="absolute left-0 top-full z-50 min-w-[220px] pt-2"
        >
          <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-white shadow-[var(--shadow-dropdown)]">
            <div
              className={cn(
                "flex",
                item.groups.length > 1
                  ? "divide-x divide-slate-100"
                  : "flex-col"
              )}
            >
              {item.groups.map((g) => (
                <section
                  key={g.title}
                  className="min-w-[200px] max-w-[260px] px-3 py-3"
                >
                  <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {g.title}
                  </p>
                  <ul className="space-y-0.5">
                    {g.links.map((l) => {
                      const linkActive = isMegaLinkActive(pathname, l.href);
                      return (
                        <li key={`${l.href}-${l.label}`}>
                          <Link
                            href={l.href}
                            role="menuitem"
                            onClick={() => setOpen(false)}
                            className={cn(
                              "block truncate rounded-lg px-2 py-2 text-sm transition-colors",
                              linkActive
                                ? "bg-blue-50 font-medium text-blue-700"
                                : "text-[var(--text-primary)] hover:bg-slate-50"
                            )}
                          >
                            {l.label}
                          </Link>
                        </li>
                      );
                    })}
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
        <DesktopMegaItem key={item.label} item={item} />
      ))}
    </nav>
  );
}

export function SiteNavMobile() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  function closeMenu() {
    setOpen(false);
    setExpanded(null);
  }

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
            onClick={closeMenu}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[min(100%,340px)] flex-col bg-[#050816] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-bold">Menu</span>
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3" aria-label="Menu mobile">
              {MEGA_NAV.map((item) => {
                const isOpen = expanded === item.label;
                const itemActive = isMegaItemActive(pathname, item);
                return (
                  <div key={item.label} className="border-b border-white/10">
                    <div className="flex items-center gap-1">
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={cn(
                          "flex flex-1 items-center gap-2 px-2 py-3 text-sm font-semibold",
                          itemActive ? "text-blue-400" : "text-white"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-blue-400" />
                        {item.label}
                      </Link>
                      {item.groups && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded(isOpen ? null : item.label)
                          }
                          className="rounded-lg p-2 text-white/60 hover:bg-white/10"
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Thu gọn" : "Mở"} ${item.label}`}
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
                                <li key={`${l.href}-${l.label}`}>
                                  <Link
                                    href={l.href}
                                    onClick={closeMenu}
                                    className={cn(
                                      "block rounded-md px-2 py-1.5 text-sm hover:bg-white/10 hover:text-white",
                                      isMegaLinkActive(pathname, l.href)
                                        ? "bg-white/10 text-white"
                                        : "text-white/70"
                                    )}
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
