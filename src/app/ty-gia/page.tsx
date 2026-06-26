import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CurrencyConverter } from "@/modules/forex/components/currency-converter";
import { getForexRatesByBank } from "@/modules/forex/service";
import { formatNumber, cn } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tỷ giá ngoại tệ hôm nay",
  description:
    "Tỷ giá USD, EUR, GBP, JPY, CNY, KRW tại Vietcombank, BIDV, Agribank, Techcombank. Công cụ quy đổi tiền tệ nhanh.",
};

type Rate = { buy: number; sell: number; ch: number };

const CURRENCIES = [
  { code: "USD", flag: "🇺🇸", name: "Đô la Mỹ" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", flag: "🇬🇧", name: "Bảng Anh" },
  { code: "JPY", flag: "🇯🇵", name: "Yên Nhật" },
  { code: "CNY", flag: "🇨🇳", name: "Nhân dân tệ" },
  { code: "KRW", flag: "🇰🇷", name: "Won Hàn" },
];

// Fallback used only when the database has no synced rates yet.
const MOCK_BANK_RATES: Record<string, Record<string, Rate>> = {
  Vietcombank: {
    USD: { buy: 25450, sell: 25780, ch: 15 },
    EUR: { buy: 27200, sell: 28350, ch: -40 },
    GBP: { buy: 31900, sell: 32650, ch: 60 },
    JPY: { buy: 167, sell: 171, ch: -0.5 },
    CNY: { buy: 3520, sell: 3580, ch: 5 },
    KRW: { buy: 18.2, sell: 18.7, ch: 0 },
  },
  BIDV: {
    USD: { buy: 25440, sell: 25770, ch: 10 },
    EUR: { buy: 27180, sell: 28330, ch: -35 },
    GBP: { buy: 31880, sell: 32630, ch: 55 },
    JPY: { buy: 166.8, sell: 170.8, ch: -0.4 },
    CNY: { buy: 3515, sell: 3575, ch: 4 },
    KRW: { buy: 18.1, sell: 18.6, ch: 0 },
  },
  Agribank: {
    USD: { buy: 25430, sell: 25760, ch: 0 },
    EUR: { buy: 27170, sell: 28320, ch: -30 },
    GBP: { buy: 31870, sell: 32620, ch: 50 },
    JPY: { buy: 166.7, sell: 170.7, ch: -0.3 },
    CNY: { buy: 3512, sell: 3572, ch: 3 },
    KRW: { buy: 18.0, sell: 18.5, ch: 0 },
  },
  Techcombank: {
    USD: { buy: 25455, sell: 25785, ch: 20 },
    EUR: { buy: 27210, sell: 28360, ch: -25 },
    GBP: { buy: 31910, sell: 32660, ch: 65 },
    JPY: { buy: 167.1, sell: 171.1, ch: -0.4 },
    CNY: { buy: 3522, sell: 3582, ch: 6 },
    KRW: { buy: 18.3, sell: 18.8, ch: 0.1 },
  },
};

export default async function ForexPage() {
  const dbRates = await getForexRatesByBank();
  const bankRates: Record<string, Record<string, Rate>> =
    dbRates.length > 0
      ? Object.fromEntries(dbRates.map((b) => [b.bankName, b.rates]))
      : MOCK_BANK_RATES;
  const banks = Object.keys(bankRates);

  return (
    <>
      <PageHeader
        title="Tỷ giá ngoại tệ hôm nay"
        description="So sánh tỷ giá USD, EUR, GBP, JPY, CNY, KRW tại các ngân hàng lớn và quy đổi tiền tệ nhanh chóng."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Tỷ giá" }]}
        icon={DollarSign}
        badge="Cập nhật hàng ngày"
      />

      <div className="container-page space-y-8 py-10">
        <CurrencyConverter />

        {/* Rate matrix per bank */}
        {banks.map((bank) => (
          <section key={bank} className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              Tỷ giá {bank}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3 text-left font-semibold">
                        Ngoại tệ
                      </th>
                      <th className="px-5 py-3 text-right font-semibold">Mua</th>
                      <th className="px-5 py-3 text-right font-semibold">Bán</th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Biến động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CURRENCIES.map((c) => {
                      const r = bankRates[bank]?.[c.code];
                      if (!r) return null;
                      const up = r.ch > 0;
                      const down = r.ch < 0;
                      return (
                        <tr key={c.code} className="hover:bg-amber-50/40">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{c.flag}</span>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {c.code}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {c.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold tabular-nums text-slate-700">
                            {formatNumber(r.buy, r.buy < 100 ? 2 : 0)}
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold tabular-nums text-amber-700">
                            {formatNumber(r.sell, r.sell < 100 ? 2 : 0)}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                                up && "bg-emerald-50 text-emerald-700",
                                down && "bg-red-50 text-red-700",
                                !up && !down && "bg-slate-100 text-slate-500"
                              )}
                            >
                              {up ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : down ? (
                                <TrendingDown className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                              {formatNumber(Math.abs(r.ch), r.ch && Math.abs(r.ch) < 1 ? 2 : 0)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}

        {/* SEO content */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Tỷ giá ngoại tệ hôm nay
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              TaiChinh.vn tổng hợp tỷ giá mua/bán các ngoại tệ phổ biến như USD,
              EUR, GBP, JPY, CNY, KRW tại các ngân hàng lớn: Vietcombank, BIDV,
              Agribank, Techcombank. Bảng tỷ giá giúp bạn dễ dàng so sánh và chọn
              ngân hàng có mức giá tốt nhất khi mua hoặc bán ngoại tệ.
            </p>
            <p>
              Công cụ quy đổi tiền tệ phía trên hỗ trợ chuyển đổi nhanh giữa các
              loại tiền tệ theo tỷ giá tham khảo mới nhất. Tỷ giá thực tế tại quầy
              giao dịch có thể chênh lệch tùy thời điểm và ngân hàng.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
