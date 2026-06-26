"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw, Check, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncButton({
  moduleKey,
  moduleName,
  disabled,
}: {
  moduleKey: string | null;
  moduleName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSync() {
    if (!moduleKey || state === "loading" || disabled) return;
    setState("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: moduleKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Đồng bộ thất bại");
      }
      setState("done");
      router.refresh();
      setTimeout(() => setState("idle"), 2000);
    } catch (e) {
      setState("error");
      setErrorMsg((e as Error).message);
      setTimeout(() => setState("idle"), 3000);
    }
  }

  if (!moduleKey) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400"
        title="Chưa có API đồng bộ"
      >
        <Ban className="h-3.5 w-3.5" /> Chưa hỗ trợ
      </span>
    );
  }

  return (
    <button
      onClick={handleSync}
      disabled={state === "loading" || disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-70",
        state === "done" && "bg-emerald-50 text-emerald-700",
        state === "error" && "bg-red-50 text-red-700",
        state !== "done" && state !== "error" && "bg-slate-900 text-white hover:bg-slate-700"
      )}
      title={errorMsg ?? `Đồng bộ ${moduleName}`}
    >
      {state === "done" ? (
        <>
          <Check className="h-3.5 w-3.5" /> Xong
        </>
      ) : state === "error" ? (
        <>Lỗi</>
      ) : (
        <>
          <RefreshCw
            className={cn("h-3.5 w-3.5", state === "loading" && "animate-spin")}
          />
          {state === "loading" ? "Đang đồng bộ" : "Đồng bộ"}
        </>
      )}
    </button>
  );
}
