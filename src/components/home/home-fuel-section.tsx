import Link from "next/link";
import { formatNumber, cn } from "@/lib/utils";

type FuelRow = {
  code: string;
  type: string;
  price: number;
  change: number;
  changePct?: number;
};

export function HomeFuelSection({ fuels }: { fuels: FuelRow[] }) {
  if (fuels.length === 0) {
    return (
      <section className="surface-card p-6 text-center">
        <h2 className="text-lg font-bold text-[#02050e]">Giá xăng dầu</h2>
        <p className="mt-2 text-sm text-slate-500">Chưa có dữ liệu giá xăng dầu.</p>
      </section>
    );
  }

  const ordered = [...fuels].sort((a, b) => {
    const rank = (c: string) =>
      c.includes("95-v") && !c.includes("e10")
        ? 0
        : c.includes("95-iii") && !c.includes("e10")
          ? 1
          : c.includes("e10")
            ? 2
            : c.includes("e5")
              ? 3
              : 9;
    return rank(a.code) - rank(b.code);
  });

  return (
    <section className="surface-card p-5 md:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold text-[#02050e]">Giá xăng dầu</h2>
        <Link
          href="/gia-xang"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Xem chi tiết
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {ordered.slice(0, 5).map((f) => {
          const pct = f.changePct;
          const down = (pct ?? f.change) < 0;
          const up = (pct ?? f.change) > 0;
          return (
            <div
              key={f.code}
              className="rounded-xl border border-[var(--border-soft)] bg-white px-3.5 py-3"
            >
              <p className="line-clamp-2 text-xs font-medium leading-snug text-slate-500">
                {f.type}
              </p>
              <p className="data-value mt-2 text-xl font-extrabold tracking-tight text-[#02050e]">
                {formatNumber(f.price)}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs font-bold tabular-nums",
                  down && "text-[var(--accent-red)]",
                  up && "text-emerald-600",
                  !up && !down && "text-slate-400"
                )}
              >
                {pct != null
                  ? `${pct > 0 ? "+" : ""}${pct.toFixed(2).replace(".", ",")}%`
                  : `${f.change > 0 ? "+" : ""}${formatNumber(f.change)}`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
