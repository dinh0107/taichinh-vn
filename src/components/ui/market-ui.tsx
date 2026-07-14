import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChangeBadge } from "./change-badge";

export function PageMain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container-page space-y-8 py-8 md:py-10", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  href,
  linkLabel = "Xem tất cả",
  icon: Icon,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-finance-200 pb-3">
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-brand-600" />}
          <h2 className="text-lg font-semibold tracking-tight text-finance-900 md:text-xl">
            {title}
          </h2>
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-finance-500">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-finance-700 transition-all hover:gap-1.5 hover:text-brand-600"
        >
          {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

const ACCENT_LINE = {
  emerald: "bg-emerald-500",
  amber: "bg-gold-500",
  sky: "bg-sky-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
  navy: "bg-finance-700",
  orange: "bg-orange-500",
} as const;

export function MetricCard({
  label,
  value,
  sub,
  change,
  changeFormat = "vnd",
  accent,
  dark,
}: {
  label: string;
  value: string;
  sub?: string;
  change?: number;
  changeFormat?: "vnd" | "usd" | "percent" | "raw";
  accent?: keyof typeof ACCENT_LINE;
  dark?: boolean;
}) {
  const line = ACCENT_LINE[accent ?? "amber"];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded border p-4 md:p-5",
        dark
          ? "border-white/10 bg-white/[0.03] backdrop-blur-sm"
          : "border-finance-200 bg-finance-panel shadow-sm"
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-px", line)} />
      <p
        className={cn(
          "label-caps",
          dark ? "text-finance-400" : "text-finance-500"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "data-value mt-2 text-xl font-semibold md:text-2xl",
          dark ? "text-white" : "text-finance-900"
        )}
      >
        {value}
      </p>
      {sub && (
        <p className={cn("mt-0.5 text-[11px]", dark ? "text-finance-500" : "text-finance-400")}>
          {sub}
        </p>
      )}
      {change != null && (
        <div className="mt-2">
          <ChangeBadge change={change} format={changeFormat} variant={dark ? "dark" : "light"} />
        </div>
      )}
    </div>
  );
}

export function DataPanel({
  title,
  children,
  className,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded border border-finance-200 bg-white shadow-sm",
        className
      )}
    >
      {title && (
        <div className="border-b border-finance-200 bg-finance-50 px-4 py-3">
          {typeof title === "string" ? (
            <h3 className="text-sm font-semibold text-finance-900">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

export function DataTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <table className={cn("w-full text-sm", className)}>
      {children}
    </table>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-finance-200 bg-finance-50 label-caps text-finance-500">
        {children}
      </tr>
    </thead>
  );
}

export function DataTableTh({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 font-semibold",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-finance-100">{children}</tbody>;
}

export function DataTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-finance-50/80", className)}>
      {children}
    </tr>
  );
}

export function DataTableTd({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}

export function ProseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-finance-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-lg font-semibold text-finance-900">{title}</h2>
      <div className="prose-tcvn mt-3 space-y-3 text-sm leading-relaxed text-finance-600">
        {children}
      </div>
    </section>
  );
}
