import { DollarSign, MousePointerClick, Eye, Megaphone, Plus } from "lucide-react";
import {
  AdminPageTitle,
  AdminCard,
  Badge,
  StatCard,
  MiniBarChart,
  EmptyState,
} from "@/components/admin/ui";
import { getAdsStats } from "@/modules/admin/service";
import {
  AD_TYPE_LABELS,
  AD_POSITION_LABELS,
} from "@/modules/admin/labels";
import type { AdType } from "@prisma/client";

const TYPE_TONE: Record<AdType, "amber" | "sky" | "violet" | "slate"> = {
  ADSENSE: "amber",
  BANNER: "sky",
  AFFILIATE_BANK: "violet",
  AFFILIATE_STOCK: "violet",
  AFFILIATE_GOLD: "violet",
  NATIVE: "slate",
};

function fmtVnd(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M đ`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K đ`;
  return `${Math.round(n).toLocaleString()} đ`;
}

export default async function AdminAdsPage() {
  const { totalRevenue, totalImpr, totalClicks, ctr, revenue6m, campaigns } =
    await getAdsStats();

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Quảng cáo & Doanh thu"
        description="Quản lý chiến dịch quảng cáo, affiliate và theo dõi doanh thu."
        action={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            <Plus className="h-4 w-4" /> Chiến dịch mới
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Doanh thu tháng"
          value={fmtVnd(totalRevenue)}
          icon={DollarSign}
          accent="emerald"
        />
        <StatCard
          label="Lượt hiển thị"
          value={totalImpr.toLocaleString()}
          icon={Eye}
          accent="sky"
        />
        <StatCard
          label="Lượt click"
          value={totalClicks.toLocaleString()}
          icon={MousePointerClick}
          accent="violet"
        />
        <StatCard
          label="CTR trung bình"
          value={totalImpr > 0 ? `${ctr.toFixed(2)}%` : "—"}
          icon={Megaphone}
          accent="amber"
        />
      </div>

      <AdminCard
        title="Doanh thu 6 tháng"
        action={
          <span className="text-sm font-bold text-emerald-600">
            {fmtVnd(totalRevenue)}
          </span>
        }
      >
        <div className="p-5">
          {revenue6m.some((r) => r.value > 0) ? (
            <MiniBarChart data={revenue6m} />
          ) : (
            <EmptyState message="Chưa có dữ liệu doanh thu theo tháng." />
          )}
        </div>
      </AdminCard>

      <AdminCard title="Chiến dịch quảng cáo">
        {campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">
                    Chiến dịch
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Loại</th>
                  <th className="px-5 py-3 text-left font-semibold">Vị trí</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Hiển thị
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">Click</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Doanh thu
                  </th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {c.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={TYPE_TONE[c.adType]}>
                        {AD_TYPE_LABELS[c.adType]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {AD_POSITION_LABELS[c.position]}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">
                      {c.impressions.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">
                      {c.clicks.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums text-emerald-700">
                      {fmtVnd(Number(c.revenue))}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge tone={c.isActive ? "emerald" : "slate"}>
                        {c.isActive ? "Đang chạy" : "Tạm dừng"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Chưa có chiến dịch quảng cáo trong database." />
        )}
      </AdminCard>
    </div>
  );
}
