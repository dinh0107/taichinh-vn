import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

const TZ = "Asia/Ho_Chi_Minh";

function asDate(date: Date | string | number | null | undefined): Date | null {
  if (date == null) return null;
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(date, { addSuffix: true, locale: vi });
}

export function formatDateVi(date: Date | string | null | undefined): string {
  const d = asDate(date);
  if (!d) return "—";
  return format(d, "dd/MM/yyyy", { locale: vi });
}

/** Today's date in Vietnam as dd/MM/yyyy (stable for titles). */
export function todayDateVi(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
}

/**
 * Child-page title date: "… hôm nay ngày dd/MM/yyyy"
 * - "Giá vàng DOJI hôm nay" → "Giá vàng DOJI hôm nay ngày 15/07/2026"
 * - "Lãi suất ngân hàng" → "Lãi suất ngân hàng hôm nay ngày 15/07/2026"
 * Idempotent if already dated. Strips trailing "| siteName" when provided.
 */
export function withHomNayTitlePrefix(
  title: string,
  now: Date = new Date(),
  siteName?: string
): string {
  let trimmed = title.trim();
  if (!trimmed) return trimmed;
  if (siteName) {
    const escaped = siteName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    trimmed = trimmed
      .replace(new RegExp(`\\s*\\|\\s*${escaped}\\s*$`, "i"), "")
      .trim();
  }
  // Fix legacy double "hôm nay hôm nay ngày …"
  trimmed = trimmed.replace(/\bhôm nay\s+hôm nay ngày\b/gi, "hôm nay ngày").trim();
  if (/hôm nay ngày\s+\d{2}\/\d{2}\/\d{4}\s*$/i.test(trimmed)) {
    // Refresh date to today if already dated
    return trimmed.replace(
      /hôm nay ngày\s+\d{2}\/\d{2}\/\d{4}\s*$/i,
      `hôm nay ngày ${todayDateVi(now)}`
    );
  }
  // Avoid "hôm nay hôm nay ngày …" when title already ends with "hôm nay"
  if (/hôm nay\s*$/i.test(trimmed)) {
    return `${trimmed} ngày ${todayDateVi(now)}`;
  }
  return `${trimmed} hôm nay ngày ${todayDateVi(now)}`;
}

export function formatTimeVi(date: Date): string {
  return format(date, "HH:mm:ss", { locale: vi });
}

/**
 * Stable SSR/client datetime in Vietnam timezone.
 * Avoids `toLocaleString()` without timeZone (Node TZ ≠ browser TZ).
 */
export function formatDateTimeVi(
  date: Date | string | number | null | undefined
): string {
  const d = asDate(date);
  if (!d) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false,
  }).format(d);
}

const WEEKDAY_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;

/** Stable SSR/client format — avoids `toLocaleString` hydration mismatch. */
export function formatHeaderDateTime(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "short",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const hour = get("hour");
  const minute = get("minute");
  const day = get("day");
  const month = get("month");
  const year = get("year");
  // Map weekday via Date in VN wall time
  const wall = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:00+07:00`
  );
  const wd = WEEKDAY_VI[wall.getUTCDay()] ?? "T2";
  return `${hour}:${minute} ${wd}, ${day}/${month}/${year}`;
}
