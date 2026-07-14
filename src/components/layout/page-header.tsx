import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  breadcrumb: { label: string; href?: string }[];
  icon?: LucideIcon;
  badge?: string;
  categoryLabel?: string;
  children?: React.ReactNode;
};

/** In-column page intro matching giahomnay hub pages */
export function PageHeader({
  title,
  description,
  breadcrumb,
  badge,
  categoryLabel,
  children,
}: Props) {
  return (
    <header className="space-y-4">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-[var(--text-secondary)]">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <span className="px-0.5 text-[var(--text-muted)]" aria-hidden>
                /
              </span>
            )}
            {b.href ? (
              <Link
                href={b.href}
                className="transition hover:text-[var(--accent-blue)]"
              >
                {b.label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--text-primary)]">
                {b.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="surface-card p-5 md:p-6">
        {(categoryLabel || badge) && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {categoryLabel && (
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                Danh mục {categoryLabel}
              </span>
            )}
            {badge && (
              <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                {badge}
              </span>
            )}
          </div>
        )}

        <h1 className="text-[24px] font-bold leading-[1.2] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[28px] lg:text-[30px]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
            {description}
          </p>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </header>
  );
}

export function ModuleSection({
  title,
  description,
  href,
  linkLabel = "Xem tất cả",
  children,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-5 md:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            {linkLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
