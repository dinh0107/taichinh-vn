import { formatNumber, formatUsd, cn } from "@/lib/utils";
import type { GoldPriceItem } from "@/modules/gold/types";
import { ChangeBadge } from "@/components/ui/change-badge";

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
  SJC: "border-amber-200 bg-amber-50 text-amber-800",
  DOJI: "border-rose-200 bg-rose-50 text-rose-800",
  PNJ: "border-violet-200 bg-violet-50 text-violet-800",
  BAO_TIN: "border-sky-200 bg-sky-50 text-sky-800",
  VIETTIN: "border-teal-200 bg-teal-50 text-teal-800",
  WORLD: "border-finance-200 bg-finance-100 text-finance-700",
  OTHER: "border-finance-200 bg-finance-50 text-finance-600",
};

function ChangeCell({ change, isUsd }: { change: number; isUsd: boolean }) {
  return (
    <ChangeBadge change={change} format={isUsd ? "usd" : "vnd"} />
  );
}

export function GoldPriceTable({ prices }: { prices: GoldPriceItem[] }) {
  return (
    <div className="overflow-hidden rounded border border-finance-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-finance-200 bg-finance-50 label-caps text-finance-500">
              <th className="px-4 py-3 font-semibold">Loại vàng</th>
              <th className="px-4 py-3 font-semibold">Thương hiệu</th>
              <th className="px-4 py-3 font-semibold text-right">Mua vào</th>
              <th className="px-4 py-3 font-semibold text-right">Bán ra</th>
              <th className="px-4 py-3 font-semibold text-right">Biến động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-finance-100">
            {prices.map((p) => {
              const isUsd = p.currency === "USD";
              return (
                <tr
                  key={p.code}
                  className="group transition-colors hover:bg-finance-50/80"
                >
                  <td className="px-4 py-3.5 font-medium text-finance-900">
                    {p.nameVi}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold",
                        BRAND_COLORS[p.brand] ?? BRAND_COLORS.OTHER
                      )}
                    >
                      {BRAND_LABELS[p.brand] ?? p.brand}
                    </span>
                  </td>
                  <td className="data-value px-4 py-3.5 text-right font-medium text-finance-700">
                    {isUsd ? formatUsd(p.buy) : formatNumber(p.buy)}
                  </td>
                  <td className="data-value px-4 py-3.5 text-right font-semibold text-gold-600">
                    {isUsd ? formatUsd(p.sell) : formatNumber(p.sell)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <ChangeCell change={p.changeBuy} isUsd={isUsd} />
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {featured.map((p, i) => {
        const isUsd = p.currency === "USD";
        return (
          <div
            key={p.code}
            className="card-hover animate-fade-up relative overflow-hidden rounded border border-finance-200 bg-finance-panel p-4 shadow-sm"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gold-500/60" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="label-caps text-finance-500">
                  {isUsd ? "USD/oz" : "VND/lượng"}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-finance-900">
                  {p.nameVi}
                </h3>
              </div>
              <ChangeCell change={p.changeBuy} isUsd={isUsd} />
            </div>

            <div className="mt-4 space-y-2 border-t border-finance-100 pt-3">
              <div className="flex items-end justify-between">
                <span className="text-[11px] text-finance-500">Bán ra</span>
                <span className="data-value text-lg font-semibold text-gold-600">
                  {isUsd ? formatUsd(p.sell) : formatNumber(p.sell)}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[11px] text-finance-500">Mua vào</span>
                <span className="data-value text-sm font-medium text-finance-600">
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
