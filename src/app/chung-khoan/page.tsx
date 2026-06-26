import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { getStockIndices } from "@/modules/stocks/service";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Chứng khoán Việt Nam",
  description: "VNINDEX, HNXINDEX, UPCOM — top tăng/giảm, thanh khoản.",
};

const MOCK_INDICES = [
  { code: "VNINDEX", value: 1285.42, change: 12.35, pct: 0.97 },
  { code: "HNXINDEX", value: 248.67, change: -1.23, pct: -0.49 },
  { code: "UPCOM", value: 98.12, change: 0.45, pct: 0.46 },
];

export default async function StocksPage() {
  const dbIndices = await getStockIndices();
  const indices = dbIndices.length > 0 ? dbIndices : MOCK_INDICES;

  const gainers = [
    { sym: "VHM", price: 42.5, pct: 6.8 },
    { sym: "SSI", price: 28.3, pct: 5.2 },
    { sym: "HPG", price: 27.1, pct: 4.1 },
  ];
  const losers = [
    { sym: "VND", price: 14.2, pct: -4.5 },
    { sym: "STB", price: 31.8, pct: -3.2 },
    { sym: "MWG", price: 58.4, pct: -2.1 },
  ];
  const liquid = [
    { sym: "HPG", value: "1.245 tỷ" },
    { sym: "SSI", value: "982 tỷ" },
    { sym: "VND", value: "847 tỷ" },
  ];

  return (
    <>
      <PageHeader
        title="Chứng khoán Việt Nam"
        description="Chỉ số VNINDEX, HNX, UPCOM cùng top cổ phiếu tăng/giảm mạnh và thanh khoản cao nhất."
        breadcrumb={[
          { label: "Trang chủ", href: "/" },
          { label: "Chứng khoán" },
        ]}
        icon={TrendingUp}
        badge="Phiên giao dịch hôm nay"
      />
      <div className="container-page space-y-8 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {indices.map((idx) => {
            const up = idx.change >= 0;
            return (
              <div
                key={idx.code}
                className="card-hover relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-1",
                    up ? "bg-emerald-400" : "bg-red-400"
                  )}
                />
                <p className="text-sm font-semibold text-slate-500">
                  {idx.code}
                </p>
                <p className="mt-2 text-3xl font-extrabold tabular-nums text-slate-900">
                  {idx.value.toLocaleString("vi-VN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={cn(
                    "mt-1 inline-flex items-center gap-1 text-sm font-semibold",
                    up ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {up ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {up ? "+" : ""}
                  {idx.change.toFixed(2)} ({idx.pct.toFixed(2)}%)
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <TopList title="Tăng mạnh nhất" items={gainers} positive />
          <TopList title="Giảm mạnh nhất" items={losers} positive={false} />
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
              <BarChart3 className="h-4 w-4 text-sky-600" />
              <h3 className="font-bold text-slate-900">Thanh khoản cao nhất</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {liquid.map((it) => (
                <div
                  key={it.sym}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <span className="font-bold text-slate-800">{it.sym}</span>
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                    {it.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Thị trường chứng khoán Việt Nam hôm nay
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              Cập nhật nhanh ba chỉ số chính của thị trường: VN-Index (HOSE),
              HNX-Index và UPCOM. Bảng xếp hạng top cổ phiếu tăng/giảm mạnh và
              thanh khoản cao nhất giúp nhà đầu tư nắm bắt dòng tiền trong phiên.
            </p>
            <p>
              Dữ liệu mang tính tham khảo, không phải khuyến nghị đầu tư. Nhà đầu
              tư nên cân nhắc kỹ trước khi ra quyết định.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

function TopList({
  title,
  items,
  positive,
}: {
  title: string;
  items: { sym: string; price: number; pct: number }[];
  positive: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
        {positive ? (
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-600" />
        )}
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((it) => (
          <div
            key={it.sym}
            className="flex items-center justify-between px-5 py-3.5"
          >
            <span className="font-bold text-slate-800">{it.sym}</span>
            <div className="flex items-center gap-4 tabular-nums">
              <span className="text-sm text-slate-600">{it.price}</span>
              <span
                className={cn(
                  "w-16 rounded-full px-2 py-0.5 text-right text-xs font-bold",
                  positive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                )}
              >
                {positive ? "+" : ""}
                {it.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
