"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { deleteSeoPage } from "@/modules/admin/seo-actions";

function DeleteInner({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (
          !confirm(`Xóa landing page "${title}"? Hành động không thể hoàn tác.`)
        ) {
          e.preventDefault();
        }
      }}
      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      title="Xóa"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function DeleteSeoButton({ id, title }: { id: string; title: string }) {
  return (
    <form action={deleteSeoPage} className="inline">
      <input type="hidden" name="id" value={id} />
      <DeleteInner title={title} />
    </form>
  );
}
