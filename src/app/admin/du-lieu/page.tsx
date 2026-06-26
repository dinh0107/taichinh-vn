import { Coins, DollarSign, Landmark, TrendingUp, Fuel } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminPageTitle, AdminCard, Badge, EmptyState } from "@/components/admin/ui";
import { SyncButton } from "@/components/admin/sync-button";
import { getDataModules, type ModuleStatus } from "@/modules/admin/service";

const ICONS: Record<string, LucideIcon> = {
  gold: Coins,
  forex: DollarSign,
  interest: Landmark,
  stocks: TrendingUp,
  fuel: Fuel,
};

const STATUS: Record<
  ModuleStatus,
  { label: string; tone: "emerald" | "amber" | "red" | "slate" }
> = {
  ok: { label: "Hoạt động", tone: "emerald" },
  warning: { label: "Chậm", tone: "amber" },
  error: { label: "Lỗi", tone: "red" },
  empty: { label: "Chưa có dữ liệu", tone: "slate" },
};

export default async function AdminDataPage() {
  const modules = await getDataModules();

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Quản lý dữ liệu"
        description="Trạng thái đồng bộ dữ liệu từ các nguồn bên ngoài cho từng module."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {modules.map((m) => {
          const Icon = ICONS[m.key] ?? Coins;
          return (
            <div
              key={m.key}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <Badge tone={STATUS[m.status].tone}>
                  {STATUS[m.status].label}
                </Badge>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {m.name}
              </p>
              <p className="text-xs text-slate-400">{m.records} bản ghi</p>
            </div>
          );
        })}
      </div>

      <AdminCard title="Chi tiết nguồn dữ liệu">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 text-left font-semibold">Module</th>
                <th className="px-5 py-3 text-left font-semibold">Nguồn</th>
                <th className="px-5 py-3 text-left font-semibold">Tần suất</th>
                <th className="px-5 py-3 text-right font-semibold">Bản ghi</th>
                <th className="px-5 py-3 text-left font-semibold">
                  Đồng bộ lần cuối
                </th>
                <th className="px-5 py-3 text-center font-semibold">
                  Trạng thái
                </th>
                <th className="px-5 py-3 text-right font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modules.map((m) => {
                const Icon = ICONS[m.key] ?? Coins;
                return (
                  <tr key={m.key} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold text-slate-900">
                          {m.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{m.source}</td>
                    <td className="px-5 py-3.5 text-slate-500">{m.freq}</td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums text-slate-700">
                      {m.records}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {m.lastSyncLabel}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge tone={STATUS[m.status].tone}>
                        {STATUS[m.status].label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <SyncButton
                        moduleKey={m.syncKey}
                        moduleName={m.name}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {modules.every((m) => m.records === 0) && (
          <EmptyState message="Chưa có dữ liệu. Nhấn Đồng bộ ở module Giá vàng để bắt đầu." />
        )}
      </AdminCard>
    </div>
  );
}
