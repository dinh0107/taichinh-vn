import Link from "next/link";
import { PageHeader, ModuleSection } from "@/components/layout/page-header";
import { MarketPageShell } from "@/components/layout/market-page-shell";
import { getFuelPrices, getFuelHistory } from "@/modules/fuel/service";
import { FuelRetailTable } from "@/modules/fuel/components/fuel-retail-table";
import { ChangeBadge } from "@/components/ui/change-badge";
import { ModuleJsonLd } from "@/components/seo/module-json-ld";
import { PageBottomArticle } from "@/components/seo/page-bottom-article";
import { buildPageMetadata, MODULE_FAQS } from "@/lib/seo/metadata";
import { formatNumber, cn } from "@/lib/utils";
import { getPublishedArticles } from "@/modules/news/service";
import { fuelDetailHref } from "@/lib/seo/detail-links";
import { ChevronRight } from "lucide-react";

export const revalidate = 300;

const PAGE_TITLE = "Giá xăng dầu hôm nay";
const PAGE_DESC =
  "Giá xăng RON95, E5, Diesel Petrolimex — cập nhật theo widget giahomnay.vn.";

export async function generateMetadata() {
  return buildPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESC,
    path: "/gia-xang",
  });
}

export default async function FuelPage() {
  const [fuels, history, articles] = await Promise.all([
    getFuelPrices(),
    getFuelHistory("RON95"),
    getPublishedArticles(5),
  ]);

  const updatedAt = fuels[0]?.updatedAt ?? null;
  const highlight = fuels.slice(0, 6);

  return (
    <MarketPageShell>
      <ModuleJsonLd
        path="/gia-xang"
        serviceName={PAGE_TITLE}
        serviceDescription={PAGE_DESC}
        breadcrumbLabel="Giá xăng"
        faqs={[...MODULE_FAQS.fuel]}
      />

      <PageHeader
        title="Giá xăng dầu Petrolimex và dầu thô thế giới"
        description="Cập nhật giá xăng dầu Petrolimex trong nước từ API widget công khai (Petrolimex), kèm biến động % và giá vùng 1/vùng 2."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Xăng dầu" }]}
        categoryLabel="Xăng dầu"
        badge="API Petrolimex"
      >
        <div className="flex flex-wrap gap-2">
          {["Trong nước", "Quốc tế"].map((t, i) => (
            <span
              key={t}
              className={cn(
                "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold",
                i === 0
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-[var(--border-soft)] bg-white text-slate-700"
              )}
            >
              {t}
            </span>
          ))}
        </div>
      </PageHeader>

      <ModuleSection
        title="Điểm nổi bật"
        description="Các mặt hàng xăng dầu chính từ Petrolimex"
      >
        {highlight.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            Đang chờ dữ liệu từ API…
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlight.map((f) => {
              const down = (f.changePct ?? f.change) < 0;
              const up = (f.changePct ?? f.change) > 0;
              const href = fuelDetailHref(f.code);
              const inner = (
                <>
                  <p className="line-clamp-2 flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
                    {f.type}
                    {href && (
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-blue-600"
                        aria-hidden
                      />
                    )}
                  </p>
                  <p className="data-value mt-2 text-xl font-extrabold text-[var(--text-primary)]">
                    {formatNumber(f.price)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs font-bold",
                      down && "text-[var(--accent-red)]",
                      up && "text-emerald-600",
                      !up && !down && "text-slate-400"
                    )}
                  >
                    {f.changePct != null
                      ? `${f.changePct > 0 ? "+" : ""}${f.changePct
                          .toFixed(2)
                          .replace(".", ",")}%`
                      : `${f.change > 0 ? "+" : ""}${formatNumber(f.change)}`}
                  </p>
                </>
              );
              return href ? (
                <Link
                  key={f.code}
                  href={href}
                  className="group rounded-xl border border-[var(--border-soft)] bg-white px-3.5 py-3 transition hover:border-blue-600/25 hover:bg-blue-50/40"
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={f.code}
                  className="rounded-xl border border-[var(--border-soft)] bg-white px-3.5 py-3"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        )}
      </ModuleSection>

      <ModuleSection
        title="Giá bán lẻ xăng dầu Petrolimex"
        description="Vùng 1 / Vùng 2 · thay đổi so với kỳ trước"
      >
        <FuelRetailTable fuels={fuels} updatedAt={updatedAt} />
      </ModuleSection>

      {history.length > 0 && (
        <ModuleSection title="Lịch sử điều chỉnh RON95 (DB)">
          <div className="overflow-hidden rounded-xl border border-[var(--border-soft)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Kỳ điều hành</th>
                  <th className="px-4 py-3 text-right">Giá (đ/lít)</th>
                  <th className="px-4 py-3 text-right">Thay đổi</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.date} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{h.date}</td>
                    <td className="data-value px-4 py-3 text-right font-bold">
                      {h.price.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChangeBadge change={h.change} format="raw" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModuleSection>
      )}

      <ModuleSection
        title="Tin tức xăng dầu"
        description="Cập nhật tin nhanh và phân tích mới nhất về xăng dầu."
        href="/tin-tuc"
        linkLabel="Xem tất cả tin"
      >
        {articles.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            Chưa có bài viết nào trong chuyên mục này.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {articles.map((a, i) => (
              <li key={a.slug}>
                <Link
                  href={`/tin-tuc/${a.slug}`}
                  className="group flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm font-semibold group-hover:text-blue-700">
                    {a.title}
                  </span>
                  {i === 0 && (
                    <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                      Nổi bật
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </ModuleSection>

      <ModuleSection title="Giá xăng dầu hôm nay bao nhiêu?">
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          Giá bán lẻ được lấy realtime từ widget{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            /api/widgets/xang-dau/petrolimex
          </code>{" "}
          (GiaHomNay). Bảng gồm RON 95, E10, E5, Diesel, dầu hỏa… kèm % thay đổi
          và giá vùng 1/vùng 2 khi API cung cấp.
        </p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Nguồn: Petrolimex widget (GiaHomNay)
        </p>
      </ModuleSection>

      <PageBottomArticle slug="gia-xang" />
    </MarketPageShell>
  );
}
