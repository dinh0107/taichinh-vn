import { PageHeader } from "@/components/layout/page-header";
import { getFuelPrices, getFuelHistory } from "@/modules/fuel/service";
import {
  DataPanel,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
  MetricCard,
  PageMain,
  ProseSection,
  SectionHeading,
} from "@/components/ui/market-ui";
import { ChangeBadge } from "@/components/ui/change-badge";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { buildPageMetadataSync, MODULE_FAQS } from "@/lib/seo/metadata";
import { Fuel } from "lucide-react";

export const revalidate = 300;

const PAGE_TITLE = "Giá xăng dầu hôm nay";
const PAGE_DESC = "Giá xăng RON95, E5, Diesel — lịch sử biến động.";

export const metadata = buildPageMetadataSync({
  title: PAGE_TITLE,
  description: PAGE_DESC,
  path: "/gia-xang",
});

const FUEL_ACCENTS = {
  RON95: "rose",
  E5: "emerald",
  DIESEL: "amber",
} as const;

const MOCK_FUELS = [
  { code: "RON95", type: "Xăng RON95-III", price: 24350, change: -500 },
  { code: "E5", type: "Xăng E5 RON92", price: 23890, change: -500 },
  { code: "DIESEL", type: "Dầu Diesel 0.05S", price: 22100, change: -300 },
];

const MOCK_HISTORY = [
  { date: "21/06/2026", price: 24350, change: -500 },
  { date: "14/06/2026", price: 24850, change: 320 },
];

export default async function FuelPage() {
  const [dbFuels, dbHistory] = await Promise.all([
    getFuelPrices(),
    getFuelHistory("RON95"),
  ]);
  const fuels = dbFuels.length > 0 ? dbFuels : MOCK_FUELS;
  const history = dbHistory.length > 0 ? dbHistory : MOCK_HISTORY;

  return (
    <>
      <ModuleJsonLd
        path="/gia-xang"
        serviceName={PAGE_TITLE}
        serviceDescription={PAGE_DESC}
        breadcrumbLabel="Giá xăng"
        faqs={[...MODULE_FAQS.fuel]}
      />
      <PageHeader
        title="Giá xăng dầu hôm nay"
        description="Giá bán lẻ xăng RON95, E5 và dầu Diesel cập nhật theo kỳ điều hành."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Giá xăng" }]}
        icon={Fuel}
        badge="Kỳ điều hành gần nhất"
      />

      <PageMain>
        <div className="grid gap-4 md:grid-cols-3">
          {fuels.map((f) => (
            <MetricCard
              key={f.code}
              label={f.type}
              value={`${f.price.toLocaleString("vi-VN")} đ/lít`}
              change={f.change}
              changeFormat="raw"
              accent={FUEL_ACCENTS[f.code as keyof typeof FUEL_ACCENTS] ?? "amber"}
            />
          ))}
        </div>

        <section className="space-y-3">
          <SectionHeading title="Lịch sử điều chỉnh RON95" />
          <DataPanel>
            <DataTable>
              <DataTableHead>
                <DataTableTh>Kỳ điều hành</DataTableTh>
                <DataTableTh align="right">Giá (đ/lít)</DataTableTh>
                <DataTableTh align="right">Thay đổi</DataTableTh>
              </DataTableHead>
              <DataTableBody>
                {history.map((h) => (
                  <DataTableRow key={h.date}>
                    <DataTableTd className="text-slate-700">{h.date}</DataTableTd>
                    <DataTableTd align="right" className="font-bold tabular-nums text-slate-800">
                      {h.price.toLocaleString("vi-VN")}
                    </DataTableTd>
                    <DataTableTd align="right">
                      <ChangeBadge change={h.change} format="raw" />
                    </DataTableTd>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </DataPanel>
        </section>

        <ProseSection title="Giá xăng dầu hôm nay bao nhiêu?">
          <p>
            Giá xăng dầu trong nước được điều chỉnh theo chu kỳ 7–10 ngày dựa trên
            biến động giá thế giới. TaiChinh.vn cập nhật giá bán lẻ xăng RON95-III, E5
            RON92 và dầu Diesel ngay sau mỗi kỳ điều hành.
          </p>
        </ProseSection>
      </PageMain>
    </>
  );
}
