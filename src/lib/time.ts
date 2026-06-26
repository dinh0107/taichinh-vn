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
