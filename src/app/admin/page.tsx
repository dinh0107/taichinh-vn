import Link from "next/link";
import {
  Eye,
  DollarSign,
  FileText,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Database,
  Megaphone,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  AdminPageTitle,
  StatCard,
  AdminCard,
  Badge,
  MiniBarChart,
  EmptyState,
} from "@/components/admin/ui";
import { getDashboardStats } from "@/modules/admin/service";
import { formatNumber } from "@/lib/utils";

function fmtVnd(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M đ`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K đ`;
  return `${formatNumber(n)} đ`;
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Tổng quan"
        description="Cập nhật nhanh tình hình traffic, doanh thu và hệ thống."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pageviews hôm nay"
          value={formatNumber(stats.pageviewsToday)}
          icon={Eye}
          delta={stats.pageviewsDelta ?? undefined}
          positive={stats.pageviewsPositive}
          accent="sky"
        />
        <StatCard
          label="Doanh thu tháng"
          value={fmtVnd(stats.revenueMonth)}
          icon={DollarSign}
          delta={stats.revenueDelta ?? undefined}
          positive={stats.revenuePositive}
          accent="emerald"
        />
        <StatCard
          label="Tổng bài viết"
          value={String(stats.articleCount)}
          icon={FileText}
          delta={
            stats.articlesThisWeek > 0
              ? `+${stats.articlesThisWeek} bài tuần này`
              : undefined
          }
          positive
          accent="violet"
        />
        <StatCard
          label="Cron jobs OK (24h)"
          value={
            stats.cronTotal > 0
              ? `${stats.cronOk}/${stats.cronTotal}`
              : "—"
          }
          icon={CheckCircle2}
          delta={
            stats.cronTotal > 0 ? "Theo nhật ký cron" : "Chưa có lịch sử cron"
          }
          positive={stats.cronOk === stats.cronTotal}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard
          title="Lưu lượng truy cập (7 ngày)"
          className="lg:col-span-2"
          action={
            stats.trafficDelta ? (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  stats.trafficPositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {stats.trafficPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {stats.trafficDelta}
              </span>
            ) : null
          }
        >
          <div className="p-5">
            {stats.trafficWeek.some((d) => d.value > 0) ? (
              <MiniBarChart data={stats.trafficWeek} />
            ) : (
              <EmptyState message="Chưa có dữ liệu traffic. Dữ liệu sẽ hiển thị khi có lượt truy cập." />
            )}
          </div>
        </AdminCard>

        <AdminCard title="Trang xem nhiều nhất">
          {stats.topPages.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.topPages.map((p) => (
                <div
                  key={p.path}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {p.path}
                    </p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
                    {p.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Chưa có dữ liệu lượt xem trang SEO." />
          )}
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard title="Hoạt động gần đây" className="lg:col-span-2">
          {stats.activity.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.activity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <Badge tone={a.tone}>•</Badge>
                  <p className="flex-1 text-sm text-slate-700">{a.text}</p>
                  <span className="shrink-0 text-xs text-slate-400">
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Chưa có hoạt động. Chạy đồng bộ dữ liệu để bắt đầu." />
          )}
        </AdminCard>

        <AdminCard title="Lối tắt">
          <div className="grid grid-cols-2 gap-3 p-4">
            <QuickLink href="/admin/du-lieu" icon={Database} label="Dữ liệu" />
            <QuickLink href="/admin/bai-viet" icon={FileText} label="Bài viết" />
            <QuickLink href="/admin/quang-cao" icon={Megaphone} label="Quảng cáo" />
            <QuickLink href="/admin/cron" icon={Clock} label="Cron & Logs" />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Database;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-xl border border-slate-200 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/40"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="flex items-center justify-between text-sm font-semibold text-slate-700">
        {label}
        <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-500" />
      </span>
    </Link>
  );
}
