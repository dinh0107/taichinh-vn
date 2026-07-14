import Link from "next/link";
import { PageHeader, ModuleSection } from "@/components/layout/page-header";
import { MarketPageShell } from "@/components/layout/market-page-shell";
import { SavingsCalculator } from "@/modules/interest/components/savings-calculator";
import { getInterestRatesByBank } from "@/modules/interest/service";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { PageBottomArticle } from "@/components/seo/page-bottom-article";
import { buildPageMetadata, MODULE_FAQS } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export const revalidate = 300;

const PAGE_TITLE = "Lãi suất ngân hàng";
const PAGE_DESC =
  "So sánh lãi suất tiết kiệm Vietcombank, BIDV, Agribank, MB Bank, ACB, Techcombank, VPBank. Tính lãi tiền gửi nhanh.";

export async function generateMetadata() {
  return buildPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESC,
    path: "/lai-suat",
  });
}

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

  return (
    <MarketPageShell>
      <ModuleJsonLd
        path="/lai-suat"
        serviceName={PAGE_TITLE}
        serviceDescription={PAGE_DESC}
        breadcrumbLabel="Lãi suất"
        faqs={[...MODULE_FAQS.interest]}
      />

      <PageHeader
        title="Lãi suất tiết kiệm và công cụ tính lãi"
        description="Cập nhật lãi suất tiết kiệm theo ngân hàng, kỳ hạn gửi và công cụ tính toán giúp người dùng so sánh nhanh lợi suất mới nhất."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Lãi suất" }]}
        categoryLabel="Lãi suất"
        badge={`Kỳ hạn 12 tháng cao nhất ${best12.toFixed(2)}%`}
      >
        <div className="no-scrollbar flex flex-wrap gap-2 overflow-x-auto">
          {BANKS.slice(0, 6).map((b) => (
            <span
              key={b.name}
              className="inline-flex h-8 items-center rounded-full border border-[var(--border-soft)] bg-white px-3 text-xs font-semibold text-slate-700"
            >
              {b.name}
            </span>
          ))}
        </div>
      </PageHeader>

      <ModuleSection
        title="Điểm nổi bật"
        description="Các chỉ số và nhóm dữ liệu được quan tâm trong danh mục"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Kỳ hạn
            </p>
            <p className="mt-1 text-lg font-bold">1 - 12 tháng</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Theo dõi lãi suất theo từng kỳ hạn gửi phổ biến
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              So sánh ngân hàng
            </p>
            <p className="mt-1 text-lg font-bold">Theo bảng tổng hợp</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Đối chiếu mức lãi suất giữa các ngân hàng
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Công cụ
            </p>
            <p className="mt-1 text-lg font-bold">Tính lãi tiết kiệm</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Ước tính số tiền nhận được theo kỳ hạn
            </p>
          </div>
        </div>
      </ModuleSection>

      <ModuleSection title="Lãi suất cao nhất (12 tháng)">
        <div className="grid gap-3 sm:grid-cols-3">
          {ranked.map((b, i) => (
            <div
              key={b.name}
              className={cn(
                "rounded-xl border px-3.5 py-4",
                i === 0
                  ? "border-blue-200 bg-blue-50/60"
                  : "border-[var(--border-soft)] bg-white"
              )}
            >
              <p className="text-xs font-medium text-slate-500">
                #{i + 1} · {b.name}
              </p>
              <p className="data-value mt-2 text-3xl font-extrabold text-emerald-700">
                {b.rates[4].toFixed(2)}%
              </p>
              <p className="text-xs text-slate-400">mỗi năm · 12 tháng</p>
            </div>
          ))}
        </div>
      </ModuleSection>

      <div className="surface-card p-5 md:p-6">
        <SavingsCalculator />
      </div>

      <ModuleSection title="So sánh lãi suất các ngân hàng">
        <div className="overflow-x-auto rounded-xl border border-[var(--border-soft)]">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/90 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Ngân hàng</th>
                {TERMS.map((t) => (
                  <th key={t} className="px-4 py-3 text-right">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANKS.map((bank) => (
                <tr
                  key={bank.name}
                  className="border-t border-slate-100 hover:bg-blue-50/40"
                >
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                    {bank.name}
                  </td>
                  {bank.rates.map((rate, i) => {
                    const isBest = i === 4 && rate === best12;
                    return (
                      <td
                        key={i}
                        className={cn(
                          "data-value px-4 py-3 text-right font-bold",
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
      </ModuleSection>

      <ModuleSection
        title="Liên kết chi tiết"
        description="Đi tới các trang chi tiết theo thương hiệu, chủ đề và bộ lọc liên quan"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-bold">Lãi suất ngân hàng</h3>
            <ul className="flex flex-wrap gap-2">
              {BANKS.map((b, i) => (
                <li key={b.name}>
                  <Link
                    href="/lai-suat"
                    className={cn(
                      "inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold",
                      i === 0
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-[var(--border-soft)] bg-white text-slate-700"
                    )}
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold">Công cụ</h3>
            <Link
              href="/lai-suat"
              className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
            >
              So sánh lãi suất ngân hàng
            </Link>
          </div>
        </div>
      </ModuleSection>

      <PageBottomArticle slug="lai-suat" />
    </MarketPageShell>
  );
}
