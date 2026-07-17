import Link from "next/link";
import { PageHeader, ModuleSection } from "@/components/layout/page-header";
import { MarketPageShell } from "@/components/layout/market-page-shell";
import { getStockIndices } from "@/modules/stocks/service";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { PageBottomArticle } from "@/components/seo/page-bottom-article";
import { buildPageMetadata, MODULE_FAQS } from "@/lib/seo/metadata";
import { stockDetailHref } from "@/lib/seo/detail-links";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const revalidate = 300;

const PAGE_TITLE = "Chứng khoán Việt Nam";
const PAGE_DESC = "VNINDEX, HNXINDEX, UPCOM — top tăng/giảm, thanh khoản.";

export async function generateMetadata() {
  return buildPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESC,
    path: "/chung-khoan",
  });
}

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
    <MarketPageShell>
      <ModuleJsonLd
        path="/chung-khoan"
        serviceName={PAGE_TITLE}
        serviceDescription={PAGE_DESC}
        breadcrumbLabel="Chứng khoán"
        faqs={[...MODULE_FAQS.stocks]}
      />

      <PageHeader
        title="Chứng khoán Việt Nam hôm nay"
        description="Chỉ số VNINDEX, HNX, UPCOM cùng top cổ phiếu tăng/giảm mạnh và thanh khoản cao nhất."
        breadcrumb={[
          { label: "Trang chủ", href: "/" },
          { label: "Chứng khoán" },
        ]}
        categoryLabel="Chứng khoán"
        badge="Phiên giao dịch hôm nay"
      />

      <ModuleSection title="Chỉ số thị trường">
        <div className="grid gap-3 md:grid-cols-3">
          {indices.map((idx) => {
            const href = stockDetailHref(idx.code);
            const inner = (
              <>
                <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {idx.code}
                  {href && (
                    <ChevronRight className="h-4 w-4 text-blue-600" aria-hidden />
                  )}
                </p>
                <p className="data-value mt-2 text-2xl font-extrabold text-[var(--text-primary)]">
                  {idx.value.toLocaleString("vi-VN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={cn(
                    "mt-1 text-sm font-bold",
                    idx.change >= 0
                      ? "text-emerald-600"
                      : "text-[var(--accent-red)]"
                  )}
                >
                  {idx.change >= 0 ? "+" : ""}
                  {idx.change.toFixed(2)} ({idx.pct.toFixed(2)}%)
                </p>
              </>
            );
            return href ? (
              <Link
                key={idx.code}
                href={href}
                className="group rounded-xl border border-[var(--border-soft)] bg-white p-4 transition hover:border-blue-600/25 hover:bg-blue-50/40"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={idx.code}
                className="rounded-xl border border-[var(--border-soft)] bg-white p-4"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </ModuleSection>

      <div className="grid gap-5 lg:grid-cols-3">
        <TopList title="Tăng mạnh nhất" items={gainers} positive />
        <TopList title="Giảm mạnh nhất" items={losers} positive={false} />
        <ModuleSection title="Thanh khoản cao nhất">
          <div className="divide-y divide-slate-100">
            {liquid.map((it) => (
              <div
                key={it.sym}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <span className="font-bold text-[var(--text-primary)]">
                  {it.sym}
                </span>
                <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                  {it.value}
                </span>
              </div>
            ))}
          </div>
        </ModuleSection>
      </div>

      <ModuleSection title="Thị trường chứng khoán Việt Nam hôm nay">
        <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          <p>
            Cập nhật nhanh ba chỉ số chính của thị trường: VN-Index (HOSE),
            HNX-Index và UPCOM. Bảng xếp hạng top cổ phiếu tăng/giảm mạnh và thanh
            khoản cao nhất giúp nhà đầu tư nắm bắt dòng tiền trong phiên.
          </p>
          <p>Dữ liệu mang tính tham khảo, không phải khuyến nghị đầu tư.</p>
        </div>
      </ModuleSection>

      <PageBottomArticle slug="chung-khoan" />
    </MarketPageShell>
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
    <ModuleSection
      title={title}
    >
      <div className="mb-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        {positive ? (
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-600" />
        )}
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((it) => (
          <div
            key={it.sym}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <span className="font-bold text-[var(--text-primary)]">{it.sym}</span>
            <div className="flex items-center gap-4 tabular-nums">
              <span className="text-sm text-slate-600">{it.price}</span>
              <span
                className={cn(
                  "min-w-14 rounded-full px-2 py-0.5 text-right text-xs font-bold",
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
    </ModuleSection>
  );
}
