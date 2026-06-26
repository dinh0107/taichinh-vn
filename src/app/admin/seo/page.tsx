import { Search, Globe, FileCheck2, Link2, RefreshCw } from "lucide-react";
import {
  AdminPageTitle,
  AdminCard,
  Badge,
  StatCard,
  EmptyState,
} from "@/components/admin/ui";
import { getSeoPages, getSeoStats } from "@/modules/admin/service";
import { SEO_PAGE_TYPE_LABELS } from "@/modules/admin/labels";
import type { SeoPageType } from "@prisma/client";

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

export default async function AdminSeoPage() {
  const [pages, stats] = await Promise.all([getSeoPages(), getSeoStats()]);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="SEO Landing Pages"
        description="Trang đích tự sinh theo từ khóa và hiệu suất tìm kiếm."
        action={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            <RefreshCw className="h-4 w-4" /> Tạo lại sitemap
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng landing page"
          value={String(stats.total)}
          icon={Globe}
          accent="sky"
        />
        <StatCard
          label="Đã index"
          value={`${stats.indexed}/${stats.total}`}
          icon={FileCheck2}
          accent="emerald"
        />
        <StatCard
          label="Tổng lượt xem"
          value={stats.totalClicks.toLocaleString()}
          icon={Link2}
          accent="violet"
        />
        <StatCard
          label="Vị trí trung bình (GSC)"
          value={stats.avgPosition != null ? String(stats.avgPosition) : "—"}
          icon={Search}
          accent="amber"
        />
      </div>

      <AdminCard title="Danh sách landing page">
        {pages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Slug</th>
                  <th className="px-5 py-3 text-left font-semibold">Loại</th>
                  <th className="px-5 py-3 text-center font-semibold">Index</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Lượt xem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map((p) => (
                  <tr key={p.slug} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">/{p.slug}</p>
                      <p className="text-xs text-slate-400">{p.title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={TYPE_TONE[p.pageType]}>
                        {SEO_PAGE_TYPE_LABELS[p.pageType]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge tone={p.isIndexed ? "emerald" : "slate"}>
                        {p.isIndexed ? "Đã index" : "Chưa"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums text-slate-700">
                      {p.viewCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Chưa có landing page SEO trong database." />
        )}
      </AdminCard>
    </div>
  );
}
