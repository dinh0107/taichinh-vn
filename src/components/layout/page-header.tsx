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
    <div className="relative overflow-hidden border-b border-finance-200 bg-finance-hero bg-finance-grid text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-finance-ink/50" />
      <div className="container-page relative py-8 md:py-10">
        <nav className="flex items-center gap-1 text-xs text-finance-400">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
              {b.href ? (
                <Link href={b.href} className="hover:text-gold-400">
                  {b.label}
                </Link>
              ) : (
                <span className="text-finance-300">{b.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="mt-5 flex items-start gap-4">
          {Icon && (
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded border border-gold-500/30 bg-gold-500/10 sm:flex">
              <Icon className="h-5 w-5 text-gold-400" />
            </div>
          )}
          <div className="flex-1">
            {badge && (
              <span className="label-caps mb-2 inline-flex items-center rounded border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-gold-400">
                {badge}
              </span>
            )}
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-finance-400 md:text-base">
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
