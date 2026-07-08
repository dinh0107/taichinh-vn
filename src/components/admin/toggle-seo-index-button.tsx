"use client";

import { useFormStatus } from "react-dom";
import { toggleSeoIndex } from "@/modules/admin/seo-actions";
import { cn } from "@/lib/utils";

function ToggleInner({ indexed }: { indexed: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold transition disabled:opacity-50",
        indexed
          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      )}
      title="Bật/tắt index"
    >
      {pending ? "..." : indexed ? "Cho phép" : "Tắt index"}
    </button>
  );
}

export function ToggleSeoIndexButton({
  id,
  isIndexed,
}: {
  id: string;
  isIndexed: boolean;
}) {
  return (
    <form action={toggleSeoIndex} className="inline">
      <input type="hidden" name="id" value={id} />
      <ToggleInner indexed={isIndexed} />
    </form>
  );
}
