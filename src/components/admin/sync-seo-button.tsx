"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import {
  syncSeoTemplates,
  revalidateSeoSitemap,
  syncGscStatus,
  type SeoFormState,
} from "@/modules/admin/seo-actions";

const initial: SeoFormState = { ok: false };

function SyncInner() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Đang đồng bộ..." : "Đồng bộ template"}
    </button>
  );
}

function SitemapInner() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
      {pending ? "..." : "Làm mới sitemap"}
    </button>
  );
}

function useToastResult(state: SeoFormState) {
  useEffect(() => {
    if (!state.message && !state.error) return;
    if (state.ok && state.message) toast.success(state.message);
    if (!state.ok && state.error) toast.error(state.error);
  }, [state]);
}

export function SyncSeoButton() {
  const [state, action] = useActionState(syncSeoTemplates, initial);
  useToastResult(state);
  return (
    <form action={action}>
      <SyncInner />
    </form>
  );
}

export function RevalidateSitemapButton() {
  const [state, action] = useActionState(revalidateSeoSitemap, initial);
  useToastResult(state);
  return (
    <form action={action}>
      <SitemapInner />
    </form>
  );
}

function GscInner() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Đang kiểm tra GSC..." : "Đồng bộ GSC"}
    </button>
  );
}

export function SyncGscButton() {
  const [state, action] = useActionState(syncGscStatus, initial);
  useToastResult(state);
  return (
    <form action={action}>
      <GscInner />
    </form>
  );
}
