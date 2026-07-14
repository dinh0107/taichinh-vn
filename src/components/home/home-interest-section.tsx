import Link from "next/link";
import { cn } from "@/lib/utils";

type BankRate = { name: string; rates: number[] };

export function HomeInterestSection({ banks }: { banks: BankRate[] }) {
  if (banks.length === 0) {
    return (
      <section className="surface-card p-6 text-center">
        <h2 className="text-lg font-bold text-[#02050e]">Lãi suất ngân hàng</h2>
        <p className="mt-2 text-sm text-slate-500">Chưa có dữ liệu lãi suất.</p>
      </section>
    );
  }

  const ranked = [...banks]
    .sort((a, b) => (b.rates[4] ?? 0) - (a.rates[4] ?? 0))
    .slice(0, 5);

  return (
    <section className="surface-card p-5 md:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold text-[#02050e]">Lãi suất ngân hàng</h2>
        <Link
          href="/lai-suat"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Xem chi tiết
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ranked.map((b, i) => (
          <div
            key={b.name}
            className={cn(
              "rounded-xl border px-3.5 py-4 text-center",
              i === 0
                ? "border-blue-200 bg-blue-50/60"
                : "border-[var(--border-soft)] bg-white"
            )}
          >
            <p className="text-xs font-medium text-slate-500">
              {b.name} <span className="text-slate-400">(12T)</span>
            </p>
            <p className="data-value mt-2 text-2xl font-extrabold tracking-tight text-[#02050e]">
              {(b.rates[4] ?? 0).toFixed(1).replace(".", ",")}
              <span className="text-base font-bold">%</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
