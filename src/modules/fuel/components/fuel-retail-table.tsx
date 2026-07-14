import { formatNumber, cn } from "@/lib/utils";
import { formatDateTimeVi } from "@/lib/time";
import type { FuelRow } from "@/modules/fuel/service";

/** Full Petrolimex retail table — same columns as giahomnay.vn widget. */
export function FuelRetailTable({
  fuels,
  updatedAt,
}: {
  fuels: FuelRow[];
  updatedAt?: Date | string | null;
}) {
  const updated = formatDateTimeVi(
    updatedAt ?? fuels[0]?.updatedAt ?? null
  );

  if (fuels.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
        Chưa có dữ liệu giá xăng dầu từ API Petrolimex.
      </p>
    );
  }

  return (
    <div>
      {updated !== "—" && (
        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          Cập nhật lúc:{" "}
          <span className="font-semibold text-blue-600">{updated}</span>
          <span className="text-[var(--text-muted)]">
            {" "}
            · Nguồn widget Petrolimex
          </span>
        </p>
      )}
      <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/90 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3 text-right">Vùng 1</th>
                <th className="px-4 py-3 text-right">Vùng 2</th>
                <th className="px-4 py-3 text-right">Thay đổi</th>
              </tr>
            </thead>
            <tbody>
              {fuels.map((f) => {
                const z1 = f.zone1 ?? f.price;
                const z2 = f.zone2 ?? f.price;
                const down = (f.changePct ?? f.change) < 0;
                const up = (f.changePct ?? f.change) > 0;
                return (
                  <tr
                    key={f.code}
                    className="border-t border-slate-100 transition-colors hover:bg-blue-50/40"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {f.type}
                      </p>
                      {f.unit && (
                        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                          {f.unit}
                        </p>
                      )}
                    </td>
                    <td
                      className={cn(
                        "data-value px-4 py-3.5 text-right font-bold",
                        down
                          ? "text-[var(--accent-red)]"
                          : up
                            ? "text-emerald-600"
                            : "text-[var(--text-primary)]"
                      )}
                    >
                      {formatNumber(z1)}
                    </td>
                    <td
                      className={cn(
                        "data-value px-4 py-3.5 text-right font-bold",
                        down
                          ? "text-[var(--accent-red)]"
                          : up
                            ? "text-emerald-600"
                            : "text-[var(--text-primary)]"
                      )}
                    >
                      {formatNumber(z2)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-bold tabular-nums",
                          down && "text-[var(--accent-red)]",
                          up && "text-emerald-600",
                          !up && !down && "text-slate-400"
                        )}
                      >
                        {f.changePct != null
                          ? `${f.changePct > 0 ? "+" : ""}${f.changePct
                              .toFixed(2)
                              .replace(".", ",")}%`
                          : `${f.change > 0 ? "+" : ""}${formatNumber(f.change)}`}
                        {(down || up) && (
                          <span aria-hidden>{down ? "▼" : "▲"}</span>
                        )}
                      </span>
                      <p className="mt-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                        {f.change > 0 ? "+" : ""}
                        {formatNumber(f.change)} đ
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
