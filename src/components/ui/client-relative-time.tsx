"use client";

import { formatRelativeTime } from "@/lib/time";

/**
 * Relative labels ("X phút trước") differ between ISR HTML and hydrate.
 * suppressHydrationWarning is intentional for wall-clock relative text.
 */
export function ClientRelativeTime({
  date,
}: {
  date: Date | string | null | undefined;
}) {
  const parsed =
    date == null ? null : date instanceof Date ? date : new Date(date);
  const valid = parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;

  return (
    <time dateTime={valid?.toISOString()} suppressHydrationWarning>
      {formatRelativeTime(valid)}
    </time>
  );
}
