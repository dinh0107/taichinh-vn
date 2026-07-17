"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LineChart } from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";
import { formatDateTimeVi } from "@/lib/time";
import { goldDetailHref } from "@/lib/seo/detail-links";
import type { GoldPriceItem } from "@/modules/gold/types";

type Unit = "chi" | "luong";

export function HomeGoldTable({ prices }: { prices: GoldPriceItem[] }) {
  const [unit, setUnit] = useState<Unit>("chi");
  const mul = unit === "luong" ? 10 : 1;
  const rows = useMemo(() => prices, [prices]);
  const updated = formatDateTimeVi(rows[0]?.recordedAt ?? null);

  const buys = rows.map((r) => r.buy * mul);
  const sells = rows.map((r) => r.sell * mul);
  const bestBuy = buys.length ? Math.max(...buys) : 0;
  const bestSell = sells.length ? Math.min(...sells) : 0;

  return (
    <section className="surface-card p-5 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3 md:items-center">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Giá vàng SJC hôm nay{" "}
            <small className="text-sm font-normal text-[var(--text-secondary)]">
              - Cập nhật lúc: {updated}
            </small>
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Chọn khu vực để xem lịch sử giá vàng chi tiết. Giá mua vào cao nhất
            và giá bán ra thấp nhất được tô màu xanh.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Tự động lấy dữ liệu cho SJC, PNJ, DOJI, Mi Hồng, Ngọc Thẩm.
          </p>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
        <div className="inline-flex shrink-0 rounded-full border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            aria-pressed={unit === "chi"}
            onClick={() => setUnit("chi")}
            className={cn(
              "whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold transition",
              unit === "chi"
                ? "bg-sky-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            Đồng/chỉ
          </button>
          <button
            type="button"
            aria-pressed={unit === "luong"}
            onClick={() => setUnit("luong")}
            className={cn(
              "whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold transition",
              unit === "luong"
                ? "bg-sky-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            Đồng/lượng
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Chưa có dữ liệu giá vàng.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Thương hiệu</th>
                  <th className="px-4 py-3 text-right">Mua vào</th>
                  <th className="px-4 py-3 text-right">Bán ra</th>
                  <th className="px-4 py-3 text-right">Chênh lệch</th>
                  <th className="px-4 py-3 text-center">Biểu đồ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50/80">
                  <td
                    colSpan={5}
                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600"
                  >
                    TP. Hồ Chí Minh
                  </td>
                </tr>
                {rows.map((p) => {
                  const buy = p.buy * mul;
                  const sell = p.sell * mul;
                  const spread = sell - buy;
                  const detailHref = goldDetailHref(p) ?? "/gia-vang";
                  return (
                    <tr
                      key={p.code}
                      className="border-t border-slate-100 transition-colors hover:bg-blue-50/40"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          href={detailHref}
                          className="font-semibold text-[var(--text-primary)] hover:text-blue-700"
                        >
                          {p.nameVi}
                        </Link>
                      </td>
                      <td
                        className={cn(
                          "data-value px-4 py-3.5 text-right font-semibold",
                          buy === bestBuy ? "text-emerald-600" : "text-slate-800"
                        )}
                      >
                        {formatNumber(buy)}
                      </td>
                      <td
                        className={cn(
                          "data-value px-4 py-3.5 text-right font-bold",
                          sell === bestSell
                            ? "text-emerald-600"
                            : "text-slate-900"
                        )}
                      >
                        {formatNumber(sell)}
                      </td>
                      <td className="data-value px-4 py-3.5 text-right font-medium text-amber-700">
                        {formatNumber(spread)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Link
                          href={detailHref}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-blue-600 transition hover:bg-blue-50"
                          aria-label={`Biểu đồ ${p.nameVi}`}
                        >
                          <LineChart className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-3 text-right">
        <Link
          href="/gia-vang"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Xem thêm
        </Link>
      </div>
    </section>
  );
}
