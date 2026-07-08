import Link from "next/link";
import { GoldBrandCode, GoldPurity } from "@prisma/client";
import { GoldPriceTable } from "@/modules/gold/components/gold-price-table";
import { getCurrentGoldPrices, filterGoldPrices } from "@/modules/gold/service";
import { getForexRatesByBank } from "@/modules/forex/service";
import { getInterestRatesByBank } from "@/modules/interest/service";
import { getStockIndices } from "@/modules/stocks/service";
import { getFuelPrices } from "@/modules/fuel/service";
import { generateGoldFaqs } from "@/lib/seo/schema";
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
  const updated = new Date().toLocaleString("vi-VN");

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
      <GoldPriceTable prices={display} />
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
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div>
        <nav className="text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-600">{page.h1}</span>
        </nav>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">{page.h1}</h1>
        <p className="mt-2 text-slate-600">
          Cập nhật lúc {updated} — Dữ liệu tham khảo từ TaiChinh.vn
        </p>
      </div>

      {children}

      {faqs.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">FAQ — {page.title}</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group border-b border-slate-100 pb-4">
                <summary className="cursor-pointer font-medium">{faq.question}</summary>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Prose({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="prose prose-slate max-w-none rounded-xl border border-slate-200 bg-white p-6">
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  );
}
