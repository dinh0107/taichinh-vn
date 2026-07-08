import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(date, { addSuffix: true, locale: vi });
}

export function formatDateVi(date: Date | null | undefined): string {
  if (!date) return "—";
  return format(date, "dd/MM/yyyy", { locale: vi });
}

export function formatTimeVi(date: Date): string {
  return format(date, "HH:mm:ss", { locale: vi });
}

const WEEKDAY_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;

/** Stable SSR/client format — avoids `toLocaleString` hydration mismatch. */
export function formatHeaderDateTime(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${WEEKDAY_VI[date.getDay()]}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
