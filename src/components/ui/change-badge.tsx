import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn, formatNumber, formatUsd } from "@/lib/utils";

type ChangeFormat = "vnd" | "usd" | "percent" | "raw";

export function ChangeBadge({
  change,
  format = "vnd",
  decimals,
  className,
  variant = "light",
}: {
  change: number;
  format?: ChangeFormat;
  decimals?: number;
  className?: string;
  variant?: "light" | "dark";
}) {
  const isUp = change > 0;
  const isDown = change < 0;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  let label: string;
  switch (format) {
    case "usd":
      label = formatUsd(Math.abs(change));
      break;
    case "percent":
      label = `${isUp ? "+" : isDown ? "-" : ""}${Math.abs(change).toFixed(decimals ?? 2)}%`;
      break;
    case "raw":
      label = `${isUp ? "+" : ""}${Math.abs(change).toLocaleString("vi-VN")}`;
      break;
    default:
      label = formatNumber(Math.abs(change), decimals ?? 0) + "đ";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        variant === "dark"
          ? isUp && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : isUp && "border-emerald-200 bg-emerald-50 text-emerald-700",
        variant === "dark"
          ? isDown && "border-red-500/30 bg-red-500/10 text-red-400"
          : isDown && "border-red-200 bg-red-50 text-red-700",
        !isUp && !isDown &&
          (variant === "dark"
            ? "border-finance-500/30 bg-white/5 text-finance-400"
            : "border-finance-200 bg-finance-50 text-finance-500"),
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}
