import Link from "next/link";
import { GoldBrandCode, GoldPurity } from "@prisma/client";
import { GoldPriceTable } from "@/modules/gold/components/gold-price-table";
import { getCurrentGoldPrices, filterGoldPrices } from "@/modules/gold/service";
import { getForexRatesByBank } from "@/modules/forex/service";
import { getInterestRatesByBank } from "@/modules/interest/service";
import { getStockIndices } from "@/modules/stocks/service";
import { getFuelPrices } from "@/modules/fuel/service";
import { generateGoldFaqs } from "@/lib/seo/schema";
import { formatDateTimeVi } from "@/lib/time";
import { ArticleBody } from "@/components/news/article-body";
import { MarketPageShell } from "@/components/layout/market-page-shell";
import { PageHeader, ModuleSection } from "@/components/layout/page-header";
import {
  DataPanel,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
  MetricCard,
} from "@/components/ui/market-ui";
import { ChangeBadge } from "@/components/ui/change-badge";
import { formatNumber } from "@/lib/utils";
import type { ResolvedSeoPage } from "@/modules/seo/service";

const TERMS = ["KKH", "1 tháng", "3 tháng", "6 tháng", "12 tháng"];

export async function SeoLandingContent({ page }: { page: ResolvedSeoPage }) {
  const updated = formatDateTimeVi(new Date());

  switch (page.pageType) {
    case "GOLD_TODAY":
    case "GOLD_BRAND":
    case "GOLD_PURITY":
      return <GoldBlock page={page} updated={updated} />;
    case "FX_CURRENCY":
      return <ForexBlock page={page} updated={updated} />;
    case "INTEREST_BANK":
      return <InterestBlock page={page} updated={updated} />;
    case "STOCK_INDEX":
      return <StockBlock page={page} updated={updated} />;
    case "FUEL_TYPE":
      return <FuelBlock page={page} updated={updated} />;
    default:
      return <CustomBlock page={page} updated={updated} />;
  }
}

async function GoldBlock({
  page,
  updated,
}: {
  page: ResolvedSeoPage;
  updated: string;
}) {
  const allPrices = await getCurrentGoldPrices();
  const prices = filterGoldPrices(allPrices, {
    brand: page.config.brand as GoldBrandCode | undefined,
    purity: page.config.purity as GoldPurity | undefined,
  });
  const display = prices.length > 0 ? prices : allPrices;
  const faqs =
    page.faqs.length > 0 ? page.faqs : generateGoldFaqs(display);

  return (
    <LandingShell page={page} updated={updated} faqs={faqs}>
      <div className="surface-card overflow-hidden">
        <GoldPriceTable prices={display} />
      </div>
      <Prose title={`${page.h1} — Phân tích nhanh`}>
        Trang cung cấp {page.title.toLowerCase()} cập nhật liên tục. So sánh giá
        mua/bán từ các thương hiệu uy tín trước khi giao dịch.
      </Prose>
    </LandingShell>
  );
}

async function ForexBlock({
  page,
  updated,
}: {
  page: ResolvedSeoPage;
  updated: string;
}) {
  const currency = page.config.currency ?? "USD";
  const banks = await getForexRatesByBank();
  const faqs =
    page.faqs.length > 0
      ? page.faqs
      : [
          {
            question: `Tỷ giá ${currency}/VND hôm nay?`,
            answer: `Xem bảng tỷ giá mua/bán ${currency} tại các ngân hàng bên dưới.`,
          },
        ];

  return (
    <LandingShell page={page} updated={updated} faqs={faqs}>
      <DataPanel>
        <DataTable>
          <DataTableHead>
            <DataTableTh>Ngân hàng</DataTableTh>
            <DataTableTh align="right">Mua</DataTableTh>
            <DataTableTh align="right">Bán</DataTableTh>
            <DataTableTh align="right">Biến động</DataTableTh>
          </DataTableHead>
          <DataTableBody>
            {banks.map((b) => {
              const r = b.rates[currency];
              if (!r) return null;
              const dec = r.buy < 100 ? 2 : 0;
              return (
                <DataTableRow key={b.bankName}>
                  <DataTableTd className="font-semibold">{b.bankName}</DataTableTd>
                  <DataTableTd align="right" className="font-bold tabular-nums">
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
      <p className="text-sm text-slate-500">
        <Link href="/ty-gia" className="font-medium text-amber-700 hover:underline">
          Xem tất cả tỷ giá →
        </Link>
      </p>
    </LandingShell>
  );
}

async function InterestBlock({
  page,
  updated,
}: {
  page: ResolvedSeoPage;
  updated: string;
}) {
  const bankName = page.config.bankName ?? page.title.replace(/^Lãi suất\s*/i, "");
  const banks = await getInterestRatesByBank();
  const bank = banks.find(
    (b) => b.name.toLowerCase() === bankName.toLowerCase()
  );
  const faqs =
    page.faqs.length > 0
      ? page.faqs
      : [
          {
            question: `Lãi suất ${bankName} 12 tháng?`,
            answer: bank
              ? `Kỳ hạn 12 tháng: ${bank.rates[4].toFixed(2)}%/năm (tham khảo).`
              : `Xem bảng lãi suất ${bankName} bên dưới.`,
          },
        ];

  return (
    <LandingShell page={page} updated={updated} faqs={faqs}>
      {bank ? (
        <DataPanel>
          <DataTable>
            <DataTableHead>
              <DataTableTh>Kỳ hạn</DataTableTh>
              <DataTableTh align="right">Lãi suất (%/năm)</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {TERMS.map((term, i) => (
                <DataTableRow key={term}>
                  <DataTableTd>{term}</DataTableTd>
                  <DataTableTd align="right" className="font-bold tabular-nums">
                    {bank.rates[i].toFixed(2)}%
                  </DataTableTd>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataPanel>
      ) : (
        <p className="text-sm text-slate-500">Chưa có dữ liệu lãi suất cho ngân hàng này.</p>
      )}
      <p className="text-sm text-slate-500">
        <Link href="/lai-suat" className="font-medium text-amber-700 hover:underline">
          So sánh tất cả ngân hàng →
        </Link>
      </p>
    </LandingShell>
  );
}

async function StockBlock({
  page,
  updated,
}: {
  page: ResolvedSeoPage;
  updated: string;
}) {
  const code = page.config.indexCode ?? "VNINDEX";
  const indices = await getStockIndices();
  const idx = indices.find((i) => i.code === code);
  const faqs = page.faqs.length > 0 ? page.faqs : [];

  return (
    <LandingShell page={page} updated={updated} faqs={faqs}>
      {idx ? (
        <MetricCard
          label={idx.code}
          value={idx.value.toLocaleString("vi-VN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          sub={`${idx.change >= 0 ? "+" : ""}${idx.change.toFixed(2)} điểm (${idx.pct.toFixed(2)}%)`}
          accent={idx.change >= 0 ? "emerald" : "rose"}
        />
      ) : (
        <p className="text-sm text-slate-500">Chưa có dữ liệu chỉ số.</p>
      )}
      <p className="text-sm text-slate-500">
        <Link href="/chung-khoan" className="font-medium text-amber-700 hover:underline">
          Xem thị trường chứng khoán →
        </Link>
      </p>
    </LandingShell>
  );
}

async function FuelBlock({
  page,
  updated,
}: {
  page: ResolvedSeoPage;
  updated: string;
}) {
  const code = page.config.fuelCode ?? "RON95";
  const fuels = await getFuelPrices();
  const fuel = fuels.find((f) => f.code === code);
  const faqs = page.faqs.length > 0 ? page.faqs : [];

  return (
    <LandingShell page={page} updated={updated} faqs={faqs}>
      {fuel ? (
        <MetricCard
          label={fuel.type}
          value={`${fuel.price.toLocaleString("vi-VN")} đ/lít`}
          change={fuel.change}
          changeFormat="raw"
          accent="amber"
        />
      ) : (
        <p className="text-sm text-slate-500">Chưa có dữ liệu giá xăng dầu.</p>
      )}
      <p className="text-sm text-slate-500">
        <Link href="/gia-xang" className="font-medium text-amber-700 hover:underline">
          Xem giá xăng dầu đầy đủ →
        </Link>
      </p>
    </LandingShell>
  );
}

function CustomBlock({
  page,
  updated,
}: {
  page: ResolvedSeoPage;
  updated: string;
}) {
  return (
    <LandingShell page={page} updated={updated} faqs={page.faqs}>
      <Prose title={page.h1}>{page.metaDescription}</Prose>
    </LandingShell>
  );
}

function LandingShell({
  page,
  updated,
  faqs,
  children,
}: {
  page: ResolvedSeoPage;
  updated: string;
  faqs: { question: string; answer: string }[];
  children: React.ReactNode;
}) {
  const breadcrumb = page.pageType.startsWith("GOLD")
    ? [
        { label: "Trang chủ", href: "/" },
        { label: "Giá vàng", href: "/gia-vang" },
        { label: page.h1 },
      ]
    : page.pageType.startsWith("FX")
      ? [
          { label: "Trang chủ", href: "/" },
          { label: "Tỷ giá", href: "/ty-gia" },
          { label: page.h1 },
        ]
      : page.pageType.startsWith("INTEREST")
        ? [
            { label: "Trang chủ", href: "/" },
            { label: "Lãi suất", href: "/lai-suat" },
            { label: page.h1 },
          ]
        : page.pageType.startsWith("STOCK")
          ? [
              { label: "Trang chủ", href: "/" },
              { label: "Chứng khoán", href: "/chung-khoan" },
              { label: page.h1 },
            ]
          : page.pageType.startsWith("FUEL")
            ? [
                { label: "Trang chủ", href: "/" },
                { label: "Xăng dầu", href: "/gia-xang" },
                { label: page.h1 },
              ]
            : [
                { label: "Trang chủ", href: "/" },
                { label: page.h1 },
              ];

  return (
    <MarketPageShell>
      <PageHeader
        title={page.h1}
        description={`Cập nhật lúc ${updated} — Dữ liệu tham khảo`}
        breadcrumb={breadcrumb}
      />

      {children}

      {page.content ? (
        <section className="surface-card overflow-hidden px-5 py-6 md:px-8 md:py-8">
          <ArticleBody html={page.content} />
        </section>
      ) : null}

      {faqs.length > 0 && (
        <ModuleSection title={`FAQ — ${page.title}`}>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, i) => (
              <details key={i} className="group py-3">
                <summary className="cursor-pointer font-medium text-[var(--text-primary)] marker:content-none">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </ModuleSection>
      )}
    </MarketPageShell>
  );
}

function Prose({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ModuleSection title={title}>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {children}
      </p>
    </ModuleSection>
  );
}
