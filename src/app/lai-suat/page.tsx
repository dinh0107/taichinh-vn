import { PageHeader } from "@/components/layout/page-header";
import { SavingsCalculator } from "@/modules/interest/components/savings-calculator";
import { getInterestRatesByBank } from "@/modules/interest/service";
import {
  DataPanel,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
  PageMain,
  ProseSection,
  SectionHeading,
} from "@/components/ui/market-ui";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { buildPageMetadataSync, MODULE_FAQS } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";
import { Landmark, Trophy } from "lucide-react";

export const revalidate = 300;

const PAGE_TITLE = "Lãi suất ngân hàng";
const PAGE_DESC =
  "So sánh lãi suất tiết kiệm Vietcombank, BIDV, Agribank, MB Bank, ACB, Techcombank, VPBank. Tính lãi tiền gửi nhanh.";

export const metadata = buildPageMetadataSync({
  title: PAGE_TITLE,
  description: PAGE_DESC,
  path: "/lai-suat",
});

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

const MEDALS = [
  "from-amber-400 to-amber-600",
  "from-slate-300 to-slate-400",
  "from-orange-300 to-orange-500",
];

export default async function InterestPage() {
  const dbBanks = await getInterestRatesByBank();
  const BANKS = dbBanks.length > 0 ? dbBanks : MOCK_BANKS;
  const best12 = Math.max(...BANKS.map((b) => b.rates[4]));
  const ranked = [...BANKS]
    .sort((a, b) => b.rates[4] - a.rates[4])
    .slice(0, 3);

  return (
    <>
      <ModuleJsonLd
        path="/lai-suat"
        serviceName={PAGE_TITLE}
        serviceDescription={PAGE_DESC}
        breadcrumbLabel="Lãi suất"
        faqs={[...MODULE_FAQS.interest]}
      />
      <PageHeader
        title="Lãi suất ngân hàng"
        description="So sánh lãi suất tiết kiệm các kỳ hạn tại 7 ngân hàng lớn và tính tiền lãi nhanh chóng."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Lãi suất" }]}
        icon={Landmark}
        badge={`Kỳ hạn 12 tháng cao nhất ${best12.toFixed(2)}%`}
      />

      <PageMain>
        <section className="space-y-4">
          <SectionHeading
            title="Lãi suất cao nhất (12 tháng)"
            icon={Trophy}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {ranked.map((b, i) => (
              <div
                key={b.name}
                className="card-hover relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div
                  className={cn(
                    "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white",
                    MEDALS[i]
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

        <section className="space-y-4">
          <SectionHeading title="So sánh lãi suất các ngân hàng" />
          <DataPanel>
            <DataTable>
              <DataTableHead>
                <DataTableTh>Ngân hàng</DataTableTh>
                {TERMS.map((t) => (
                  <DataTableTh key={t} align="right">
                    {t}
                  </DataTableTh>
                ))}
              </DataTableHead>
              <DataTableBody>
                {BANKS.map((bank) => (
                  <DataTableRow key={bank.name}>
                    <DataTableTd className="font-semibold text-slate-900">
                      {bank.name}
                    </DataTableTd>
                    {bank.rates.map((rate, i) => {
                      const isBest = i === 4 && rate === best12;
                      return (
                        <DataTableTd
                          key={i}
                          align="right"
                          className={cn(
                            "font-bold tabular-nums",
                            isBest ? "text-emerald-700" : "text-slate-600"
                          )}
                        >
                          {isBest && (
                            <span className="mr-1.5 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                              Cao nhất
                            </span>
                          )}
                          {rate.toFixed(2)}%
                        </DataTableTd>
                      );
                    })}
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </DataPanel>
        </section>

        <ProseSection title="Gửi tiết kiệm ngân hàng nào lãi cao nhất?">
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
        </ProseSection>
      </PageMain>
    </>
  );
}
