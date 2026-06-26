import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { getFuelPrices, getFuelHistory } from "@/modules/fuel/service";
import { Fuel, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Giá xăng dầu hôm nay",
  description: "Giá xăng RON95, E5, Diesel — lịch sử biến động.",
};

const FUEL_COLORS: Record<string, string> = {
  RON95: "from-rose-400 to-rose-600",
  E5: "from-emerald-400 to-emerald-600",
  DIESEL: "from-amber-400 to-amber-600",
};

const MOCK_FUELS = [
  { code: "RON95", type: "Xăng RON95-III", price: 24350, change: -500 },
  { code: "E5", type: "Xăng E5 RON92", price: 23890, change: -500 },
  { code: "DIESEL", type: "Dầu Diesel 0.05S", price: 22100, change: -300 },
];

const MOCK_HISTORY = [
  { date: "21/06/2026", price: 24350, change: -500 },
  { date: "14/06/2026", price: 24850, change: 320 },
  { date: "07/06/2026", price: 24530, change: -180 },
  { date: "31/05/2026", price: 24710, change: 450 },
  { date: "24/05/2026", price: 24260, change: -210 },
];

export default async function FuelPage() {
  const [dbFuels, dbHistory] = await Promise.all([
    getFuelPrices(),
    getFuelHistory("RON95"),
  ]);
  const fuels = (dbFuels.length > 0 ? dbFuels : MOCK_FUELS).map((f) => ({
    ...f,
    color: FUEL_COLORS[f.code] ?? "from-slate-400 to-slate-600",
  }));
  const HISTORY = dbHistory.length > 0 ? dbHistory : MOCK_HISTORY;

  return (
    <>
      <PageHeader
        title="Giá xăng dầu hôm nay"
        description="Giá bán lẻ xăng RON95, E5 và dầu Diesel cập nhật theo kỳ điều hành của liên Bộ Công Thương - Tài chính."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Giá xăng" }]}
        icon={Fuel}
        badge="Kỳ điều hành gần nhất"
      />
      <div className="container-page space-y-8 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {fuels.map((f) => {
            const up = f.change >= 0;
            return (
              <div
                key={f.type}
                className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-md`}
                >
                  <Fuel className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">{f.type}</p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">
                  {f.price.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    đ/lít
                  </span>
                </p>
                <p
                  className={cn(
                    "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                    up
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  )}
                >
                  {up ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {up ? "+" : ""}
                  {f.change.toLocaleString()} đ
                </p>
              </div>
            );
          })}
        </div>

        {/* History */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="font-bold text-slate-900">Lịch sử điều chỉnh RON95</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Kỳ điều hành</th>
                  <th className="px-5 py-3 text-right font-semibold">Giá (đ/lít)</th>
                  <th className="px-5 py-3 text-right font-semibold">Thay đổi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {HISTORY.map((h) => {
                  const up = h.change >= 0;
                  return (
                    <tr key={h.date} className="hover:bg-amber-50/40">
                      <td className="px-5 py-3.5 text-slate-700">{h.date}</td>
                      <td className="px-5 py-3.5 text-right font-bold tabular-nums text-slate-800">
                        {h.price.toLocaleString()}
                      </td>
                      <td
                        className={cn(
                          "px-5 py-3.5 text-right font-semibold tabular-nums",
                          up ? "text-emerald-600" : "text-red-600"
                        )}
                      >
                        {up ? "+" : ""}
                        {h.change.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Giá xăng dầu hôm nay bao nhiêu?
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              Giá xăng dầu trong nước được điều chỉnh theo chu kỳ 7-10 ngày dựa
              trên biến động giá thế giới. TaiChinh.vn cập nhật giá bán lẻ xăng
              RON95-III, E5 RON92 và dầu Diesel ngay sau mỗi kỳ điều hành.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
