import Link from "next/link";
import { PageHeader, ModuleSection } from "@/components/layout/page-header";
import { MarketPageShell } from "@/components/layout/market-page-shell";
import { CurrencyConverter } from "@/modules/forex/components/currency-converter";
import { getForexRatesByBank } from "@/modules/forex/service";
import { ChangeBadge } from "@/components/ui/change-badge";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { PageBottomArticle } from "@/components/seo/page-bottom-article";
import { buildPageMetadata, MODULE_FAQS } from "@/lib/seo/metadata";
import { fxDetailHref } from "@/lib/seo/detail-links";
import { formatNumber, cn } from "@/lib/utils";

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
  const primaryBank = banks.find((b) => b.toLowerCase().includes("vietcombank")) ?? banks[0];
  const usd = primaryBank ? bankRates[primaryBank]?.USD : undefined;

  return (
    <MarketPageShell>
      <ModuleJsonLd
        path="/ty-gia"
        serviceName={PAGE_TITLE}
        serviceDescription={PAGE_DESC}
        breadcrumbLabel="Tỷ giá"
        faqs={[...MODULE_FAQS.forex]}
      />

      <PageHeader
        title="Tỷ giá ngân hàng theo từng đơn vị niêm yết"
        description="Tổng hợp tỷ giá mua bán tại Vietcombank, BIDV, VietinBank và nhiều ngân hàng khác, cập nhật liên tục để so sánh nhanh trong ngày."
        breadcrumb={[
          { label: "Trang chủ", href: "/" },
          { label: "Tỷ giá ngân hàng" },
        ]}
        categoryLabel="Tỷ giá ngân hàng"
        badge="Cập nhật hàng ngày"
      >
        <div className="no-scrollbar flex flex-wrap gap-2 overflow-x-auto">
          {banks.slice(0, 6).map((bank) => (
            <span
              key={bank}
              className="inline-flex h-8 items-center rounded-full border border-[var(--border-soft)] bg-white px-3 text-xs font-semibold text-slate-700"
            >
              {bank}
            </span>
          ))}
        </div>
      </PageHeader>

      {usd && primaryBank && (
        <ModuleSection
          title={`Tỷ giá USD tại ${primaryBank.includes("Vietcombank") || primaryBank.toLowerCase().includes("vietcombank") ? "VCB" : primaryBank}`}
          description={`Cập nhật giá mua tiền mặt và bán ra USD mới nhất tại ${primaryBank}`}
          href="/ty-gia-usd-hom-nay"
          linkLabel="Xem chi tiết"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
              <p className="text-[11px] text-[var(--text-muted)]">Mua vào</p>
              <p className="data-value mt-1 text-2xl font-extrabold text-[var(--accent-red)]">
                {formatNumber(usd.buy)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                VND/USD · Giá mua vào tiền mặt 1 USD
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
              <p className="text-[11px] text-[var(--text-muted)]">Bán ra</p>
              <p className="data-value mt-1 text-2xl font-extrabold text-emerald-600">
                {formatNumber(usd.sell)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                VND/USD · Giá bán ra 1 USD
              </p>
            </div>
          </div>
        </ModuleSection>
      )}

      <div className="surface-card p-5 md:p-6">
        <CurrencyConverter />
      </div>

      {banks.map((bank) => (
        <ModuleSection key={bank} title={`Tỷ giá ${bank}`}>
          <div className="overflow-hidden rounded-xl border border-[var(--border-soft)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Ngoại tệ</th>
                  <th className="px-4 py-3 text-right">Mua</th>
                  <th className="px-4 py-3 text-right">Bán</th>
                  <th className="px-4 py-3 text-right">Biến động</th>
                </tr>
              </thead>
              <tbody>
                {CURRENCIES.map((c) => {
                  const r = bankRates[bank]?.[c.code];
                  if (!r) return null;
                  const dec = r.buy < 100 ? 2 : 0;
                  return (
                    <tr
                      key={c.code}
                      className="border-t border-slate-100 hover:bg-blue-50/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{c.flag}</span>
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">
                              {c.code}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {c.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="data-value px-4 py-3 text-right font-semibold text-[var(--accent-red)]">
                        {formatNumber(r.buy, dec)}
                      </td>
                      <td className="data-value px-4 py-3 text-right font-bold text-emerald-600">
                        {formatNumber(r.sell, dec)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChangeBadge change={r.ch} format="raw" decimals={dec} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ModuleSection>
      ))}

      <ModuleSection
        title="Liên kết chi tiết"
        description="Đi tới trang tỷ giá chi tiết theo từng ngoại tệ"
      >
        <h3 className="mb-2 text-sm font-bold">Tỷ giá theo ngoại tệ</h3>
        <ul className="flex flex-wrap gap-2">
          {CURRENCIES.map((c, i) => (
            <li key={c.code}>
              <Link
                href={fxDetailHref(c.code) ?? "/ty-gia"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  i === 0
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-[var(--border-soft)] bg-white text-slate-700 hover:border-blue-200"
                )}
              >
                <span aria-hidden>{c.flag}</span>
                {c.code} · {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </ModuleSection>

      <ModuleSection title="Tỷ giá ngoại tệ hôm nay">
        <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          <p>
            Tổng hợp tỷ giá mua/bán các ngoại tệ phổ biến như USD, EUR, GBP, JPY,
            CNY, KRW tại các ngân hàng lớn. Bảng tỷ giá giúp bạn dễ dàng so sánh và
            chọn ngân hàng có mức giá tốt nhất.
          </p>
          <p>
            Công cụ quy đổi tiền tệ hỗ trợ chuyển đổi nhanh giữa các loại tiền tệ
            theo tỷ giá tham khảo mới nhất.
          </p>
        </div>
      </ModuleSection>

      <PageBottomArticle slug="ty-gia" />
    </MarketPageShell>
  );
}
