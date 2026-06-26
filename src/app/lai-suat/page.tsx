import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SavingsCalculator } from "@/modules/interest/components/savings-calculator";
import { getInterestRatesByBank } from "@/modules/interest/service";
import { cn } from "@/lib/utils";
import { Landmark, Trophy } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Lãi suất ngân hàng",
  description:
    "So sánh lãi suất tiết kiệm Vietcombank, BIDV, Agribank, MB Bank, ACB, Techcombank, VPBank. Tính lãi tiền gửi nhanh.",
};

const MOCK_BANKS = [
  { name: "Vietcombank", rates: [0.1, 4.6, 4.75, 5.5, 6.2] },
  { name: "BIDV", rates: [0.1, 4.55, 4.7, 5.45, 6.15] },
  { name: "Agribank", rates: [0.1, 4.5, 4.65, 5.4, 6.1] },
  { name: "MB Bank", rates: [0.15, 4.7, 4.85, 5.6, 6.3] },
  { name: "ACB", rates: [0.1, 4.65, 4.8, 5.55, 6.25] },
  { name: "Techcombank", rates: [0.1, 4.6, 4.75, 5.5, 6.2] },
  { name: "VPBank", rates: [0.1, 4.75, 4.9, 5.65, 6.35] },
];
const TERMS = ["KKH", "1 tháng", "3 tháng", "6 tháng", "12 tháng"];

export default async function InterestPage() {
  const dbBanks = await getInterestRatesByBank();
  const BANKS = dbBanks.length > 0 ? dbBanks : MOCK_BANKS;
  const best12 = Math.max(...BANKS.map((b) => b.rates[4]));
  const ranked = [...BANKS]
    .sort((a, b) => b.rates[4] - a.rates[4])
    .slice(0, 3);
  const medals = ["from-amber-400 to-amber-600", "from-slate-300 to-slate-400", "from-orange-300 to-orange-500"];

  return (
    <>
      <PageHeader
        title="Lãi suất ngân hàng"
        description="So sánh lãi suất tiết kiệm các kỳ hạn tại 7 ngân hàng lớn và tính tiền lãi nhanh chóng."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Lãi suất" }]}
        icon={Landmark}
        badge={`Kỳ hạn 12 tháng cao nhất ${best12.toFixed(2)}%`}
      />

      <div className="container-page space-y-8 py-10">
        {/* Top 3 best rates */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Lãi suất cao nhất (12 tháng)
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {ranked.map((b, i) => (
              <div
                key={b.name}
                className="card-hover relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div
                  className={cn(
                    "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white",
                    medals[i]
                  )}
                >
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-slate-500">{b.name}</p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                  {b.rates[4].toFixed(2)}%
                </p>
                <p className="text-xs text-slate-400">mỗi năm · kỳ hạn 12 tháng</p>
              </div>
            ))}
          </div>
        </section>

        <SavingsCalculator />

        {/* Full comparison table */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            So sánh lãi suất các ngân hàng
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3.5 text-left font-semibold">
                      Ngân hàng
                    </th>
                    {TERMS.map((t) => (
                      <th
                        key={t}
                        className="px-5 py-3.5 text-right font-semibold"
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {BANKS.map((bank) => (
                    <tr key={bank.name} className="hover:bg-amber-50/40">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {bank.name}
                      </td>
                      {bank.rates.map((rate, i) => {
                        const isBest = i === 4 && rate === best12;
                        return (
                          <td
                            key={i}
                            className={cn(
                              "px-5 py-4 text-right font-bold tabular-nums",
                              isBest ? "text-emerald-700" : "text-slate-600"
                            )}
                          >
                            {isBest && (
                              <span className="mr-1.5 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                                Cao nhất
                              </span>
                            )}
                            {rate.toFixed(2)}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Gửi tiết kiệm ngân hàng nào lãi cao nhất?
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              Bảng so sánh lãi suất huy động giúp bạn lựa chọn ngân hàng phù hợp
              theo từng kỳ hạn. Hiện tại, các ngân hàng tư nhân như VPBank, MB
              Bank thường có lãi suất nhỉnh hơn nhóm ngân hàng quốc doanh
              (Vietcombank, BIDV, Agribank).
            </p>
            <p>
              Sử dụng công cụ tính lãi phía trên để ước tính số tiền nhận được khi
              đáo hạn. Lãi suất thực tế có thể thay đổi theo chính sách từng thời
              kỳ và số tiền gửi.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
