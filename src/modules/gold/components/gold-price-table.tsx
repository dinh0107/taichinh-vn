import { formatNumber, formatUsd, cn } from "@/lib/utils";
import type { GoldPriceItem } from "@/modules/gold/types";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

const BRAND_LABELS: Record<string, string> = {
  SJC: "SJC",
  DOJI: "DOJI",
  PNJ: "PNJ",
  BAO_TIN: "Bảo Tín",
  VIETTIN: "Viettin",
  WORLD: "Thế giới",
  OTHER: "Khác",
};

const BRAND_COLORS: Record<string, string> = {
  SJC: "bg-amber-100 text-amber-700",
  DOJI: "bg-rose-100 text-rose-700",
  PNJ: "bg-violet-100 text-violet-700",
  BAO_TIN: "bg-sky-100 text-sky-700",
  VIETTIN: "bg-teal-100 text-teal-700",
  WORLD: "bg-slate-200 text-slate-700",
  OTHER: "bg-slate-100 text-slate-600",
};

function ChangeBadge({ change, isUsd }: { change: number; isUsd: boolean }) {
  const isUp = change > 0;
  const isDown = change < 0;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        isUp && "bg-emerald-50 text-emerald-700",
        isDown && "bg-red-50 text-red-700",
        !isUp && !isDown && "bg-slate-100 text-slate-500"
      )}
    >
      <Icon className="h-3 w-3" />
      {isUsd
        ? formatUsd(Math.abs(change))
        : formatNumber(Math.abs(change)) + "đ"}
    </span>
  );
}

export function GoldPriceTable({ prices }: { prices: GoldPriceItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3.5 font-semibold">Loại vàng</th>
              <th className="px-5 py-3.5 font-semibold">Thương hiệu</th>
              <th className="px-5 py-3.5 font-semibold text-right">Mua vào</th>
              <th className="px-5 py-3.5 font-semibold text-right">Bán ra</th>
              <th className="px-5 py-3.5 font-semibold text-right">Biến động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prices.map((p) => {
              const isUsd = p.currency === "USD";
              return (
                <tr
                  key={p.code}
                  className="group transition-colors hover:bg-amber-50/40"
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {p.nameVi}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
                        BRAND_COLORS[p.brand] ?? BRAND_COLORS.OTHER
                      )}
                    >
                      {BRAND_LABELS[p.brand] ?? p.brand}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold tabular-nums text-slate-800">
                    {isUsd ? formatUsd(p.buy) : formatNumber(p.buy)}
                  </td>
                  <td className="px-5 py-4 text-right font-bold tabular-nums text-amber-700">
                    {isUsd ? formatUsd(p.sell) : formatNumber(p.sell)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ChangeBadge change={p.changeBuy} isUsd={isUsd} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GoldPriceCards({ prices }: { prices: GoldPriceItem[] }) {
  const featured = prices.filter((p) =>
    ["SJL1L10", "DOHNL", "PQHNVM", "XAUUSD"].includes(p.code)
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {featured.map((p, i) => {
        const isUsd = p.currency === "USD";
        const isUp = p.changeBuy > 0;
        const isDown = p.changeBuy < 0;
        return (
          <div
            key={p.code}
            className="card-hover animate-float-up relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-1",
                isUp
                  ? "bg-emerald-400"
                  : isDown
                    ? "bg-red-400"
                    : "bg-slate-300"
              )}
            />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {isUsd ? "USD/oz" : "VND/lượng"}
                </p>
                <h3 className="mt-0.5 font-bold text-slate-900">{p.nameVi}</h3>
              </div>
              <ChangeBadge change={p.changeBuy} isUsd={isUsd} />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-xs text-slate-400">Bán ra</span>
                <span className="text-xl font-extrabold tabular-nums text-amber-700">
                  {isUsd ? formatUsd(p.sell) : formatNumber(p.sell)}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xs text-slate-400">Mua vào</span>
                <span className="text-sm font-semibold tabular-nums text-slate-600">
                  {isUsd ? formatUsd(p.buy) : formatNumber(p.buy)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
