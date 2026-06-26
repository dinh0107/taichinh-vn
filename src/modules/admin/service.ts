import prisma from "@/lib/db";
import { formatRelativeTime } from "@/lib/time";
import { cronStatusToUi } from "@/modules/admin/labels";
import type { CronJobStatus } from "@prisma/client";

export type ModuleStatus = "ok" | "warning" | "error" | "empty";

export type DataModuleInfo = {
  key: string;
  name: string;
  source: string;
  records: number;
  lastSync: Date | null;
  lastSyncLabel: string;
  status: ModuleStatus;
  freq: string;
  syncKey: string | null;
};

export type DashboardStats = {
  pageviewsToday: number;
  pageviewsDelta: string | null;
  pageviewsPositive: boolean;
  revenueMonth: number;
  revenueDelta: string | null;
  revenuePositive: boolean;
  articleCount: number;
  articlesThisWeek: number;
  cronOk: number;
  cronTotal: number;
  trafficWeek: { label: string; value: number }[];
  trafficDelta: string | null;
  trafficPositive: boolean;
  topPages: { path: string; views: number; pct: number }[];
  activity: { text: string; time: string; tone: "emerald" | "amber" | "red" | "sky" | "violet" | "slate" }[];
};

const CRON_JOB_DEFS = [
  { name: "sync-gold-prices", schedule: "*/5 * * * *", syncKey: "gold" },
  { name: "sync-forex", schedule: "*/30 * * * *", syncKey: "forex" },
  { name: "sync-interest", schedule: "0 6 * * *", syncKey: "interest" },
  { name: "sync-stocks", schedule: "*/15 9-15 * * 1-5", syncKey: "stocks" },
  { name: "ai-write-articles", schedule: "0 7 * * *", syncKey: null },
  { name: "generate-sitemap", schedule: "0 2 * * *", syncKey: null },
] as const;

const MODULE_DEFS = [
  {
    key: "gold",
    name: "Giá vàng",
    source: "giavang.now",
    freq: "5 phút/lần",
    syncKey: "gold",
    warnMs: 15 * 60 * 1000,
    count: () => prisma.goldPrice.count(),
    lastSync: () =>
      prisma.goldPrice
        .findFirst({ orderBy: { recordedAt: "desc" }, select: { recordedAt: true } })
        .then((r) => r?.recordedAt ?? null),
    cronName: "sync-gold-prices",
  },
  {
    key: "forex",
    name: "Tỷ giá",
    source: "adapter",
    freq: "30 phút/lần",
    syncKey: "forex",
    warnMs: 60 * 60 * 1000,
    count: () => prisma.exchangeRate.count(),
    lastSync: () =>
      prisma.exchangeRate
        .findFirst({ orderBy: { recordedAt: "desc" }, select: { recordedAt: true } })
        .then((r) => r?.recordedAt ?? null),
    cronName: "sync-forex",
  },
  {
    key: "interest",
    name: "Lãi suất",
    source: "adapter",
    freq: "1 ngày/lần",
    syncKey: "interest",
    warnMs: 48 * 60 * 60 * 1000,
    count: () => prisma.bankInterestRate.count(),
    lastSync: () =>
      prisma.bankInterestRate
        .findFirst({ orderBy: { recordedAt: "desc" }, select: { recordedAt: true } })
        .then((r) => r?.recordedAt ?? null),
    cronName: "sync-interest",
  },
  {
    key: "stocks",
    name: "Chứng khoán",
    source: "adapter",
    freq: "15 phút/lần",
    syncKey: "stocks",
    warnMs: 30 * 60 * 1000,
    count: () => prisma.stockQuote.count(),
    lastSync: () =>
      prisma.stockIndex
        .findFirst({ orderBy: { recordedAt: "desc" }, select: { recordedAt: true } })
        .then((r) => r?.recordedAt ?? null),
    cronName: "sync-stocks",
  },
  {
    key: "fuel",
    name: "Giá xăng",
    source: "adapter",
    freq: "Theo kỳ điều hành",
    syncKey: "fuel",
    warnMs: 14 * 24 * 60 * 60 * 1000,
    count: () => prisma.fuelPrice.count(),
    lastSync: () =>
      prisma.fuelPrice
        .findFirst({ orderBy: { recordedAt: "desc" }, select: { recordedAt: true } })
        .then((r) => r?.recordedAt ?? null),
    cronName: "sync-fuel",
  },
] as const;

function resolveModuleStatus(
  records: number,
  lastSync: Date | null,
  warnMs: number,
  lastCronFailed: boolean
): ModuleStatus {
  if (lastCronFailed) return "error";
  if (records === 0) return "empty";
  if (!lastSync) return "warning";
  if (Date.now() - lastSync.getTime() > warnMs) return "warning";
  return "ok";
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function pctChange(current: number, previous: number): { text: string; positive: boolean } | null {
  if (previous === 0) return current > 0 ? { text: "Mới có dữ liệu", positive: true } : null;
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return {
    text: `${sign}${pct.toFixed(1)}% so với kỳ trước`,
    positive: pct >= 0,
  };
}

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export async function getDataModules(): Promise<DataModuleInfo[]> {
  const cronLogs = await prisma.cronJobLog.findMany({
    where: {
      jobName: { in: MODULE_DEFS.map((m) => m.cronName) },
    },
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  const lastCronByJob = new Map<string, CronJobStatus>();
  for (const log of cronLogs) {
    if (!lastCronByJob.has(log.jobName)) {
      lastCronByJob.set(log.jobName, log.status);
    }
  }

  return Promise.all(
    MODULE_DEFS.map(async (mod) => {
      const [records, lastSync] = await Promise.all([mod.count(), mod.lastSync()]);
      const lastCronFailed = lastCronByJob.get(mod.cronName) === "FAILED";
      const status = resolveModuleStatus(
        records,
        lastSync,
        mod.warnMs,
        lastCronFailed
      );

      let source: string = mod.source;
      if (mod.key === "forex" && records > 0) {
        const latestRate = await prisma.exchangeRate.findFirst({
          orderBy: { recordedAt: "desc" },
          select: { source: true },
        });
        if (latestRate?.source) source = latestRate.source;
      } else if (mod.key === "gold" && records > 0) {
        source = "giavang.now";
      } else if (records > 0) {
        const sample = await getModuleSource(mod.key);
        if (sample) source = sample;
      }

      return {
        key: mod.key,
        name: mod.name,
        source,
        records,
        lastSync,
        lastSyncLabel: formatRelativeTime(lastSync),
        status,
        freq: mod.freq,
        syncKey: mod.syncKey,
      };
    })
  );
}

async function getModuleSource(key: string): Promise<string | null> {
  switch (key) {
    case "interest": {
      const r = await prisma.bankInterestRate.findFirst({
        orderBy: { recordedAt: "desc" },
        select: { source: true },
      });
      return r?.source ?? null;
    }
    case "fuel": {
      const r = await prisma.fuelPrice.findFirst({
        orderBy: { recordedAt: "desc" },
        select: { source: true },
      });
      return r?.source ?? null;
    }
    default:
      return null;
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = startOfDay();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const monthStart = startOfMonth();
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    viewsTodayAgg,
    viewsYesterdayAgg,
    revenueMonthAgg,
    revenuePrevMonthAgg,
    articleCount,
    articlesThisWeek,
    cronLogs24h,
    trafficWeekRaw,
    topPagesRaw,
    recentCron,
    recentArticles,
    recentApiLogs,
  ] = await Promise.all([
    prisma.trafficStat.aggregate({
      where: { date: today },
      _sum: { views: true },
    }),
    prisma.trafficStat.aggregate({
      where: { date: yesterday },
      _sum: { views: true },
    }),
    prisma.revenueStat.aggregate({
      where: { date: { gte: monthStart } },
      _sum: { revenue: true },
    }),
    prisma.revenueStat.aggregate({
      where: { date: { gte: prevMonthStart, lt: monthStart } },
      _sum: { revenue: true },
    }),
    prisma.newsArticle.count(),
    prisma.newsArticle.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.cronJobLog.findMany({
      where: { startedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      select: { status: true },
    }),
    prisma.trafficStat.groupBy({
      by: ["date"],
      where: { date: { gte: weekAgo } },
      _sum: { views: true },
      orderBy: { date: "asc" },
    }),
    prisma.seoPage.findMany({
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { slug: true, viewCount: true },
    }),
    prisma.cronJobLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 8,
    }),
    prisma.newsArticle.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, isAiGenerated: true, createdAt: true, status: true },
    }),
    prisma.apiSyncLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      where: { success: false },
    }),
  ]);

  let pageviewsToday = viewsTodayAgg._sum.views ?? 0;
  const pageviewsYesterday = viewsYesterdayAgg._sum.views ?? 0;

  if (pageviewsToday === 0 && topPagesRaw.length > 0) {
    pageviewsToday = topPagesRaw.reduce((s, p) => s + p.viewCount, 0);
  }

  let revenueMonth = Number(revenueMonthAgg._sum.revenue ?? 0);
  const revenuePrevMonth = Number(revenuePrevMonthAgg._sum.revenue ?? 0);

  if (revenueMonth === 0) {
    const adRev = await prisma.adCampaign.aggregate({ _sum: { revenue: true } });
    revenueMonth = Number(adRev._sum.revenue ?? 0);
  }

  const pvDelta = pctChange(pageviewsToday, pageviewsYesterday);
  const revDelta = pctChange(revenueMonth, revenuePrevMonth);

  const cronOk = cronLogs24h.filter((l) => l.status === "SUCCESS").length;
  const cronTotal = cronLogs24h.length;

  const trafficMap = new Map(
    trafficWeekRaw.map((r) => [
      startOfDay(new Date(r.date)).toDateString(),
      r._sum.views ?? 0,
    ])
  );

  const trafficWeek: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    trafficWeek.push({
      label: DAY_LABELS[d.getDay()],
      value: trafficMap.get(d.toDateString()) ?? 0,
    });
  }

  const weekTotal = trafficWeek.reduce((s, d) => s + d.value, 0);
  const prevWeekHalf = trafficWeek.slice(0, 3).reduce((s, d) => s + d.value, 0);
  const currWeekHalf = trafficWeek.slice(4).reduce((s, d) => s + d.value, 0);
  const trafficDeltaObj = pctChange(currWeekHalf, prevWeekHalf);

  const maxViews = Math.max(...topPagesRaw.map((p) => p.viewCount), 1);
  const topPages = topPagesRaw.map((p) => ({
    path: `/${p.slug}`,
    views: p.viewCount,
    pct: Math.round((p.viewCount / maxViews) * 100),
  }));

  const activity: DashboardStats["activity"] = [];

  for (const log of recentCron) {
    const tone =
      log.status === "SUCCESS"
        ? "emerald"
        : log.status === "FAILED"
          ? "red"
          : "sky";
    const msg =
      log.status === "SUCCESS"
        ? `Cron ${log.jobName} thành công (${log.recordsSync} bản ghi)`
        : log.status === "FAILED"
          ? `Cron ${log.jobName} lỗi: ${log.error ?? "không rõ"}`
          : `Cron ${log.jobName} đang chạy`;
    activity.push({
      text: msg,
      time: formatRelativeTime(log.startedAt),
      tone,
    });
  }

  for (const article of recentArticles) {
    if (article.status !== "PUBLISHED") continue;
    activity.push({
      text: article.isAiGenerated
        ? `Bài viết AI: “${article.title}”`
        : `Bài viết mới: “${article.title}”`,
      time: formatRelativeTime(article.createdAt),
      tone: "violet",
    });
  }

  for (const api of recentApiLogs) {
    activity.push({
      text: `API ${api.source} lỗi: ${api.error ?? `HTTP ${api.statusCode}`}`,
      time: formatRelativeTime(api.createdAt),
      tone: "amber",
    });
  }

  activity.sort((a, b) => 0); // already roughly ordered by query

  return {
    pageviewsToday,
    pageviewsDelta: pvDelta?.text ?? null,
    pageviewsPositive: pvDelta?.positive ?? true,
    revenueMonth,
    revenueDelta: revDelta?.text ?? null,
    revenuePositive: revDelta?.positive ?? true,
    articleCount,
    articlesThisWeek,
    cronOk: cronTotal > 0 ? cronOk : 0,
    cronTotal: cronTotal > 0 ? cronTotal : CRON_JOB_DEFS.length,
    trafficWeek,
    trafficDelta: trafficDeltaObj?.text ?? null,
    trafficPositive: trafficDeltaObj?.positive ?? true,
    topPages,
    activity: activity.slice(0, 8),
  };
}

export async function getArticles() {
  return prisma.newsArticle.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      status: true,
      isAiGenerated: true,
      publishedAt: true,
      createdAt: true,
    },
  });
}

export async function getArticleStats() {
  const [total, published, aiCount] = await Promise.all([
    prisma.newsArticle.count(),
    prisma.newsArticle.count({ where: { status: "PUBLISHED" } }),
    prisma.newsArticle.count({ where: { isAiGenerated: true } }),
  ]);
  return { total, published, aiCount, totalViews: 0 };
}

export async function getSeoPages() {
  return prisma.seoPage.findMany({
    orderBy: { viewCount: "desc" },
    select: {
      slug: true,
      title: true,
      pageType: true,
      isIndexed: true,
      viewCount: true,
    },
  });
}

export async function getSeoStats() {
  const pages = await getSeoPages();
  const indexed = pages.filter((p) => p.isIndexed).length;
  const totalClicks = pages.reduce((s, p) => s + p.viewCount, 0);
  return { total: pages.length, indexed, totalClicks, avgPosition: null as number | null };
}

export async function getAdCampaigns() {
  return prisma.adCampaign.findMany({
    orderBy: { revenue: "desc" },
  });
}

export async function getAdsStats() {
  const campaigns = await getAdCampaigns();
  const totalRevenue = campaigns.reduce((s, c) => s + Number(c.revenue), 0);
  const totalImpr = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const ctr = totalImpr > 0 ? (totalClicks / totalImpr) * 100 : 0;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthly = await prisma.revenueStat.groupBy({
    by: ["date"],
    where: { date: { gte: sixMonthsAgo } },
    _sum: { revenue: true },
    orderBy: { date: "asc" },
  });

  const revenue6m =
    monthly.length > 0
      ? monthly.map((m) => ({
          label: `T${new Date(m.date).getMonth() + 1}`,
          value: Number(m._sum.revenue ?? 0),
        }))
      : buildFallbackRevenue6m(totalRevenue);

  return { totalRevenue, totalImpr, totalClicks, ctr, revenue6m, campaigns };
}

function buildFallbackRevenue6m(total: number) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: `T${d.getMonth() + 1}`,
      value: i === 5 ? total : 0,
    };
  });
}

export async function getCronOverview() {
  const logs = await prisma.cronJobLog.findMany({
    orderBy: { startedAt: "desc" },
    take: 200,
  });

  const jobs = CRON_JOB_DEFS.map((def) => {
    const runs = logs.filter((l) => l.jobName === def.name);
    const latest = runs[0];
    const uiStatus = latest ? cronStatusToUi(latest.status) : ("success" as const);

    return {
      name: def.name,
      schedule: def.schedule,
      syncKey: def.syncKey,
      lastRun: latest
        ? latest.status === "RUNNING"
          ? "Đang chạy"
          : formatRelativeTime(latest.startedAt)
        : "Chưa chạy",
      duration:
        latest?.durationMs != null
          ? `${(latest.durationMs / 1000).toFixed(1)}s`
          : "—",
      status: latest ? uiStatus : ("success" as const),
      recordsSync: latest?.recordsSync ?? 0,
    };
  });

  const ok = jobs.filter((j) => j.status === "success").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  const running = jobs.filter((j) => j.status === "running").length;

  return { jobs, ok, failed, running, total: jobs.length };
}

export async function getSystemLogs() {
  const [cronLogs, apiLogs] = await Promise.all([
    prisma.cronJobLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    }),
    prisma.apiSyncLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  type LogLine = {
    at: Date;
    time: string;
    job: string;
    level: "info" | "warn" | "error";
    message: string;
  };

  const lines: LogLine[] = [];

  for (const log of cronLogs) {
    const level =
      log.status === "FAILED"
        ? "error"
        : log.status === "RUNNING"
          ? "info"
          : "info";
    const message =
      log.status === "SUCCESS"
        ? `Đồng bộ ${log.recordsSync} bản ghi (${log.durationMs ?? 0}ms)`
        : log.status === "FAILED"
          ? log.error ?? "Cron thất bại"
          : "Đang chạy...";
    lines.push({
      at: log.startedAt,
      time: formatRelativeTime(log.startedAt),
      job: log.jobName,
      level,
      message,
    });
  }

  for (const log of apiLogs) {
    lines.push({
      at: log.createdAt,
      time: formatRelativeTime(log.createdAt),
      job: log.source,
      level: log.success ? "info" : log.latencyMs && log.latencyMs > 3000 ? "warn" : "error",
      message: log.success
        ? `${log.endpoint} OK (${log.latencyMs ?? 0}ms)`
        : log.error ?? `${log.endpoint} thất bại`,
    });
  }

  lines.sort((a, b) => b.at.getTime() - a.at.getTime());

  return lines.slice(0, 30).map(({ at: _, ...rest }) => rest);
}

export { CRON_JOB_DEFS };
