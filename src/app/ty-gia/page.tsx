import { PageHeader } from "@/components/layout/page-header";
import { CurrencyConverter } from "@/modules/forex/components/currency-converter";
import { getForexRatesByBank } from "@/modules/forex/service";
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
import { ChangeBadge } from "@/components/ui/change-badge";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { buildPageMetadata, MODULE_FAQS } from "@/lib/seo/metadata";
import { formatNumber } from "@/lib/utils";
import { DollarSign } from "lucide-react";

export const revalidate = 300;

const PAGE_TITLE = "Tỷ giá ngoại tệ hôm nay";
const PAGE_DESC =
  "Tỷ giá USD, EUR, GBP, JPY, CNY, KRW tại Vietcombank, BIDV, Agribank, Techcombank. Công cụ quy đổi tiền tệ nhanh.";

export async function generateMetadata() {
  return buildPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESC,
    path: "/ty-gia",
  });
}

type Rate = { buy: number; sell: number; ch: number };

const CURRENCIES = [
  { code: "USD", flag: "🇺🇸", name: "Đô la Mỹ" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", flag: "🇬🇧", name: "Bảng Anh" },
  { code: "JPY", flag: "🇯🇵", name: "Yên Nhật" },
  { code: "CNY", flag: "🇨🇳", name: "Nhân dân tệ" },
  { code: "KRW", flag: "🇰🇷", name: "Won Hàn" },
];

const MOCK_BANK_RATES: Record<string, Record<string, Rate>> = {
  Vietcombank: {
    USD: { buy: 25450, sell: 25780, ch: 15 },
    EUR: { buy: 27200, sell: 28350, ch: -40 },
    GBP: { buy: 31900, sell: 32650, ch: 60 },
    JPY: { buy: 167, sell: 171, ch: -0.5 },
    CNY: { buy: 3520, sell: 3580, ch: 5 },
    KRW: { buy: 18.2, sell: 18.7, ch: 0 },
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
      <ModuleJsonLd
        path="/ty-gia"
        serviceName={PAGE_TITLE}
        serviceDescription={PAGE_DESC}
        breadcrumbLabel="Tỷ giá"
        faqs={[...MODULE_FAQS.forex]}
      />
      <PageHeader
        title="Tỷ giá ngoại tệ hôm nay"
        description="So sánh tỷ giá USD, EUR, GBP, JPY, CNY, KRW tại các ngân hàng lớn và quy đổi tiền tệ nhanh chóng."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Tỷ giá" }]}
        icon={DollarSign}
        badge="Cập nhật hàng ngày"
      />

      <PageMain>
        <CurrencyConverter />

        {banks.map((bank) => (
          <section key={bank} className="space-y-3">
            <SectionHeading title={`Tỷ giá ${bank}`} />
            <DataPanel>
              <DataTable>
                <DataTableHead>
                  <DataTableTh>Ngoại tệ</DataTableTh>
                  <DataTableTh align="right">Mua</DataTableTh>
                  <DataTableTh align="right">Bán</DataTableTh>
                  <DataTableTh align="right">Biến động</DataTableTh>
                </DataTableHead>
                <DataTableBody>
                  {CURRENCIES.map((c) => {
                    const r = bankRates[bank]?.[c.code];
                    if (!r) return null;
                    const dec = r.buy < 100 ? 2 : 0;
                    return (
                      <DataTableRow key={c.code}>
                        <DataTableTd>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{c.flag}</span>
                            <div>
                              <p className="font-semibold text-slate-900">{c.code}</p>
                              <p className="text-xs text-slate-400">{c.name}</p>
                            </div>
                          </div>
                        </DataTableTd>
                        <DataTableTd align="right" className="font-bold tabular-nums text-slate-700">
                          {formatNumber(r.buy, dec)}
                        </DataTableTd>
                        <DataTableTd align="right" className="font-bold tabular-nums text-amber-700">
                          {formatNumber(r.sell, dec)}
                        </DataTableTd>
                        <DataTableTd align="right">
                          <ChangeBadge change={r.ch} format="raw" decimals={dec} />
                        </DataTableTd>
                      </DataTableRow>
                    );
                  })}
                </DataTableBody>
              </DataTable>
            </DataPanel>
          </section>
        ))}

        <ProseSection title="Tỷ giá ngoại tệ hôm nay">
          <p>
            TaiChinh.vn tổng hợp tỷ giá mua/bán các ngoại tệ phổ biến như USD,
            EUR, GBP, JPY, CNY, KRW tại các ngân hàng lớn. Bảng tỷ giá giúp bạn
            dễ dàng so sánh và chọn ngân hàng có mức giá tốt nhất khi mua hoặc bán
            ngoại tệ.
          </p>
          <p>
            Công cụ quy đổi tiền tệ phía trên hỗ trợ chuyển đổi nhanh giữa các loại
            tiền tệ theo tỷ giá tham khảo mới nhất. Tỷ giá thực tế tại quầy giao dịch
            có thể chênh lệch tùy thời điểm và ngân hàng.
          </p>
        </ProseSection>
      </PageMain>
    </>
  );
}
