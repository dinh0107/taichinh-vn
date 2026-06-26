import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  breadcrumb: { label: string; href?: string }[];
  icon?: LucideIcon;
  badge?: string;
  children?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  breadcrumb,
  icon: Icon,
  badge,
  children,
}: Props) {
  return (
    <div className="relative overflow-hidden border-b border-slate-800 bg-slate-900 text-white">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-gold-radial" />
      <div className="container-page relative py-10 md:py-12">
        <nav className="flex items-center gap-1 text-xs text-slate-400">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {b.href ? (
                <Link href={b.href} className="hover:text-amber-300">
                  {b.label}
                </Link>
              ) : (
                <span className="text-slate-200">{b.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="mt-4 flex items-start gap-4">
          {Icon && (
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25">
              <Icon className="h-7 w-7" />
            </div>
          )}
          <div className="flex-1">
            {badge && (
              <span className="mb-2 inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                {badge}
              </span>
            )}
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                {description}
              </p>
            )}
          </div>
        </div>

        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
