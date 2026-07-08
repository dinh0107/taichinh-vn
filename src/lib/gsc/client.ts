import type { GscIndexStatus } from "@prisma/client";
import { getGscAccessToken } from "./auth";

export type GscCredentials = {
  clientEmail: string;
  privateKey: string;
  propertyUrl: string;
};

export type UrlInspectionResult = {
  status: GscIndexStatus;
  coverageState: string | null;
  lastCrawlAt: Date | null;
  rawVerdict: string | null;
};

export type PageAnalytics = {
  clicks: number;
  impressions: number;
  position: number;
};

type InspectionResponse = {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: string;
      coverageState?: string;
      lastCrawlTime?: string;
      indexingState?: string;
      pageFetchState?: string;
    };
  };
  error?: { message?: string };
};

type AnalyticsResponse = {
  rows?: {
    keys?: string[];
    clicks?: number;
    impressions?: number;
    position?: number;
  }[];
};

function encodeSiteUrl(siteUrl: string): string {
  return encodeURIComponent(siteUrl);
}

export function mapCoverageToStatus(
  verdict: string | undefined,
  coverageState: string | undefined
): GscIndexStatus {
  const state = (coverageState ?? "").toLowerCase();
  const v = (verdict ?? "").toUpperCase();

  if (state.includes("duplicate")) return "DUPLICATE";
  if (state.includes("blocked") || state.includes("robots")) return "BLOCKED";
  if (state.includes("submitted and indexed") || state.includes("indexed")) {
    return "INDEXED";
  }
  if (state.includes("crawled") && state.includes("not indexed")) {
    return "CRAWLED_NOT_INDEXED";
  }
  if (state.includes("discovered") && state.includes("not indexed")) {
    return "NOT_INDEXED";
  }
  if (state.includes("unknown to google")) return "NOT_INDEXED";

  if (v === "PASS") return "INDEXED";
  if (v === "NEUTRAL") return "CRAWLED_NOT_INDEXED";
  if (v === "FAIL" || v === "PARTIAL") return "NOT_INDEXED";

  return "UNKNOWN";
}

export async function inspectUrl(
  creds: GscCredentials,
  pageUrl: string
): Promise<UrlInspectionResult> {
  const token = await getGscAccessToken(creds.clientEmail, creds.privateKey);

  const res = await fetch(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inspectionUrl: pageUrl,
        siteUrl: creds.propertyUrl,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`URL Inspection failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as InspectionResponse;
  if (data.error?.message) {
    return {
      status: "ERROR",
      coverageState: data.error.message,
      lastCrawlAt: null,
      rawVerdict: null,
    };
  }

  const idx = data.inspectionResult?.indexStatusResult;
  const coverageState = idx?.coverageState ?? null;
  const lastCrawlAt = idx?.lastCrawlTime ? new Date(idx.lastCrawlTime) : null;

  return {
    status: mapCoverageToStatus(idx?.verdict, coverageState ?? undefined),
    coverageState,
    lastCrawlAt,
    rawVerdict: idx?.verdict ?? null,
  };
}

export async function fetchPageAnalytics(
  creds: GscCredentials,
  startDate: string,
  endDate: string,
  rowLimit = 1000
): Promise<Map<string, PageAnalytics>> {
  const token = await getGscAccessToken(creds.clientEmail, creds.privateKey);
  const site = encodeSiteUrl(creds.propertyUrl);

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search Analytics failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as AnalyticsResponse;
  const map = new Map<string, PageAnalytics>();

  for (const row of data.rows ?? []) {
    const url = row.keys?.[0];
    if (!url) continue;
    map.set(normalizePageUrl(url), {
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      position: row.position ?? 0,
    });
  }

  return map;
}

export function normalizePageUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "") || "/";
    return path;
  } catch {
    return url;
  }
}

export async function listGscSites(creds: GscCredentials): Promise<string[]> {
  const token = await getGscAccessToken(creds.clientEmail, creds.privateKey);
  const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`List sites failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { siteEntry?: { siteUrl?: string }[] };
  return (data.siteEntry ?? [])
    .map((e) => e.siteUrl)
    .filter((s): s is string => Boolean(s));
}
