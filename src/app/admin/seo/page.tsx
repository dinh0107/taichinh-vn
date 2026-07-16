import Link from "next/link";
import { Plus, Search, Globe, FileCheck2, Link2, Eye, Pencil } from "lucide-react";
import {
  AdminPageTitle,
  AdminCard,
  Badge,
  StatCard,
  EmptyState,
} from "@/components/admin/ui";
import { DeleteSeoButton } from "@/components/admin/delete-seo-button";
import { ToggleSeoIndexButton } from "@/components/admin/toggle-seo-index-button";
import {
  SyncSeoButton,
  RevalidateSitemapButton,
  SyncGscButton,
} from "@/components/admin/sync-seo-button";
import { getSeoPagesList, getSeoStats } from "@/modules/admin/seo-service";
import { SEO_PAGE_TYPE_LABELS, GSC_INDEX_STATUS_LABELS } from "@/modules/admin/labels";
import { pageArticleDefBySlug } from "@/modules/admin/page-articles";
import { isGscEnabled } from "@/lib/gsc/feature";
import { withHtmlExtension } from "@/lib/seo/html-path";
import type { SeoPageType } from "@prisma/client";
import { formatRelativeTime } from "@/lib/time";

const TYPE_TONE: Record<SeoPageType, "amber" | "sky" | "violet" | "slate"> = {
  GOLD_TODAY: "amber",
  GOLD_BRAND: "amber",
  GOLD_PURITY: "amber",
  FX_CURRENCY: "sky",
  INTEREST_BANK: "violet",
  STOCK_INDEX: "violet",
  FUEL_TYPE: "slate",
  CUSTOM: "slate",
};

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const gscOn = isGscEnabled();
  const type =
    sp.type && sp.type in SEO_PAGE_TYPE_LABELS
      ? (sp.type as SeoPageType)
      : undefined;

  const [pages, stats] = await Promise.all([
    getSeoPagesList({ q: sp.q, type }),
    getSeoStats(),
  ]);

  const gscErrorSample = pages.find(
    (p) => p.gscIndexStatus === "ERROR" && p.gscCoverageState
  )?.gscCoverageState;
  const gscErrorCount = pages.filter((p) => p.gscIndexStatus === "ERROR").length;

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="SEO Landing Pages"
        description="Soạn nội dung chi tiết từng trang, quản lý landing SEO, sitemap và GSC index. Bấm Đồng bộ template để tạo sẵn trang chủ / giá vàng / tỷ giá…"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <RevalidateSitemapButton />
            {gscOn && <SyncGscButton />}
            <SyncSeoButton />
            <Link
              href="/admin/seo/moi"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" /> Trang mới
            </Link>
          </div>
        }
      />

      {gscOn && gscErrorCount > 0 && gscErrorSample && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-semibold">
            GSC: {gscErrorCount} trang báo «Lỗi API»
          </p>
          <p className="mt-1 break-words text-xs text-red-800/90" title={gscErrorSample}>
            Chi tiết: {gscErrorSample}
          </p>
          <p className="mt-2 text-xs text-red-700/80">
            Kiểm tra Property URL ={" "}
            <code className="rounded bg-red-100 px-1">https://giahomnay.site/</code>, SA
            đã Add user trên Search Console, rồi bấm <strong>Đồng bộ GSC</strong> lại.
            Nếu thấy lỗi cột <code className="rounded bg-red-100 px-1">gscCoverageState</code>
            , chạy SQL:{" "}
            <code className="rounded bg-red-100 px-1">
              ALTER TABLE seo_pages MODIFY gscCoverageState TEXT NULL;
            </code>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Trong database"
          value={String(stats.total)}
          icon={Globe}
          accent="sky"
        />
        <StatCard
          label="Template chuẩn"
          value={String(stats.templateTotal)}
          icon={FileCheck2}
          accent="amber"
        />
        <StatCard
          label="Cho phép index"
          value={`${stats.indexed}/${stats.total || stats.templateTotal}`}
          icon={Search}
          accent="emerald"
          delta="Sitemap + noindex"
          positive
        />
        {gscOn ? (
          <StatCard
            label="GSC đã index"
            value={`${stats.gscIndexed}/${stats.total || 0}`}
            icon={Link2}
            accent="violet"
            delta={
              stats.lastGscSync
                ? `Đồng bộ ${formatRelativeTime(stats.lastGscSync)}`
                : "Chưa đồng bộ GSC"
            }
            positive={stats.gscIndexed > 0}
          />
        ) : (
          <StatCard
            label="Lượt xem trang"
            value={stats.totalClicks.toLocaleString()}
            icon={Link2}
            accent="violet"
          />
        )}
      </div>

      <AdminCard title="Bộ lọc">
        <form className="flex flex-wrap items-end gap-3 p-5" method="get">
          <label className="min-w-[200px] flex-1">
            <span className="mb-1 block text-xs font-medium text-slate-500">Tìm kiếm</span>
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="slug hoặc tiêu đề..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
            />
          </label>
          <label className="min-w-[160px]">
            <span className="mb-1 block text-xs font-medium text-slate-500">Loại</span>
            <select
              name="type"
              defaultValue={sp.type ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
            >
              <option value="">Tất cả</option>
              {Object.entries(SEO_PAGE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Lọc
          </button>
        </form>
      </AdminCard>

      <AdminCard title={`Danh sách (${pages.length})`}>
        {pages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Slug</th>
                  <th className="px-5 py-3 text-left font-semibold">Loại</th>
                  <th className="px-5 py-3 text-center font-semibold">Nguồn</th>
                  <th className="px-5 py-3 text-center font-semibold">Cho phép</th>
                  {gscOn && (
                    <th className="px-5 py-3 text-center font-semibold">GSC index</th>
                  )}
                  <th className="px-5 py-3 text-right font-semibold">Lượt xem</th>
                  <th className="px-5 py-3 text-right font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map((p) => {
                  const gsc = GSC_INDEX_STATUS_LABELS[p.gscIndexStatus] ?? GSC_INDEX_STATUS_LABELS.UNKNOWN;
                  const hub = pageArticleDefBySlug(p.slug);
                  const publicHref = withHtmlExtension(hub?.path ?? `/${p.slug}`);
                  return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{publicHref}</p>
                      <p className="max-w-xs truncate text-xs text-slate-400">{p.title}</p>
                      {p.hasContent && (
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                          Đã có bài
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={TYPE_TONE[p.pageType]}>
                        {hub ? "Trang module" : SEO_PAGE_TYPE_LABELS[p.pageType]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs text-slate-500">
                      {p.isAutoGenerated ? "Template" : "Thủ công"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <ToggleSeoIndexButton id={p.id} isIndexed={p.isIndexed} />
                    </td>
                    {gscOn && (
                      <td className="px-5 py-3.5 text-center">
                        <Badge tone={gsc.tone}>{gsc.label}</Badge>
                        {p.gscCoverageState && (
                          <p
                            className="mx-auto mt-1 max-w-[11rem] truncate text-[10px] leading-snug text-slate-400"
                            title={p.gscCoverageState}
                          >
                            {p.gscCoverageState}
                          </p>
                        )}
                        {p.gscPosition != null && p.gscPosition > 0 && (
                          <p className="mt-1 text-[10px] text-slate-400">
                            Pos {p.gscPosition.toFixed(1)}
                          </p>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums text-slate-700">
                      {p.viewCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={publicHref}
                          target="_blank"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600"
                          title="Xem trang công khai"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/seo/${p.id}`}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteSeoButton id={p.id} title={p.title} />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Chưa có landing page. Nhấn «Đồng bộ template» để tạo bộ trang chuẩn." />
        )}
      </AdminCard>

      <p className="text-xs text-slate-400">
        <Globe className="mr-1 inline h-3.5 w-3.5" />
        «Cho phép» = sitemap / noindex. Cột «GSC index» = trạng thái thật từ Google Search
        Console — cấu hình key tại{" "}
        <Link href="/admin/cai-dat" className="text-amber-700 underline">
          Cài đặt
        </Link>
        , rồi bấm «Đồng bộ GSC».
      </p>
    </div>
  );
}
