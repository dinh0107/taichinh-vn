import { CheckCircle2, XCircle, Clock, Activity } from "lucide-react";
import {
  AdminPageTitle,
  AdminCard,
  Badge,
  StatCard,
  EmptyState,
} from "@/components/admin/ui";
import { getCronOverview, getSystemLogs } from "@/modules/admin/service";

const STATUS = {
  success: { label: "Thành công", tone: "emerald" as const, icon: CheckCircle2 },
  failed: { label: "Lỗi", tone: "red" as const, icon: XCircle },
  running: { label: "Đang chạy", tone: "sky" as const, icon: Activity },
};

const LEVEL: Record<
  "info" | "warn" | "error",
  { tone: "slate" | "amber" | "red"; label: string }
> = {
  info: { tone: "slate", label: "INFO" },
  warn: { tone: "amber", label: "WARN" },
  error: { tone: "red", label: "ERROR" },
};

export default async function AdminCronPage() {
  const [{ jobs, ok, failed, running, total }, logs] = await Promise.all([
    getCronOverview(),
    getSystemLogs(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Cron jobs & Logs"
        description="Theo dõi các tác vụ định kỳ và nhật ký hệ thống."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng job" value={String(total)} icon={Clock} accent="sky" />
        <StatCard
          label="Thành công"
          value={String(ok)}
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Đang chạy"
          value={String(running)}
          icon={Activity}
          accent="amber"
        />
        <StatCard label="Lỗi" value={String(failed)} icon={XCircle} accent="violet" />
      </div>

      <AdminCard title="Danh sách Cron jobs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 text-left font-semibold">Job</th>
                <th className="px-5 py-3 text-left font-semibold">Lịch (cron)</th>
                <th className="px-5 py-3 text-left font-semibold">Chạy lần cuối</th>
                <th className="px-5 py-3 text-right font-semibold">Thời lượng</th>
                <th className="px-5 py-3 text-center font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((j) => {
                const s = STATUS[j.status];
                return (
                  <tr key={j.name} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">
                      {j.name}
                      {j.error && (
                        <p
                          className="mt-1 max-w-md whitespace-normal break-words font-sans text-[11px] font-normal leading-snug text-red-600"
                          title={j.error}
                        >
                          {j.error}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      {j.schedule}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{j.lastRun}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">
                      {j.duration}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5">
                        <s.icon
                          className={
                            j.status === "success"
                              ? "h-4 w-4 text-emerald-600"
                              : j.status === "failed"
                                ? "h-4 w-4 text-red-600"
                                : "h-4 w-4 text-sky-600"
                          }
                        />
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminCard title="Nhật ký hệ thống (gần nhất)">
        {logs.length > 0 ? (
          <div className="divide-y divide-slate-100 font-mono text-xs">
            {logs.map((l, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-2.5">
                <span className="shrink-0 text-slate-400">{l.time}</span>
                <Badge tone={LEVEL[l.level].tone}>{LEVEL[l.level].label}</Badge>
                <span className="shrink-0 font-semibold text-slate-500">
                  [{l.job}]
                </span>
                <span className="break-words text-slate-700">{l.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Chưa có nhật ký. Chạy đồng bộ giá vàng để tạo log đầu tiên." />
        )}
      </AdminCard>
    </div>
  );
}
