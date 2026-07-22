"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { AI_CATEGORY_OPTIONS } from "@/modules/admin/settings-shared";

export function AiWriteArticleButton() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleWrite() {
    if (state === "loading") return;
    setState("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/admin/ai-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category ? { category } : {}),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        reason?: string;
        slug?: string;
        editUrl?: string;
        status?: string;
        prompts?: {
          model: string;
          system: string;
          user: string;
          articlePromptTemplate: string;
          topic: string;
          date: string;
        };
      };

      if (data.prompts) {
        console.group("[Tạo bài AI] Prompt hiện tại");
        console.log("model:", data.prompts.model);
        console.log("topic:", data.prompts.topic);
        console.log("date:", data.prompts.date);
        console.log(
          "articlePromptTemplate (Admin):",
          data.prompts.articlePromptTemplate
        );
        console.log("system:", data.prompts.system);
        console.log("user:", data.prompts.user);
        console.groupEnd();
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.reason || "Sinh bài thất bại");
      }

      setState("done");
      setMessage(
        data.status === "PUBLISHED"
          ? "Đã tạo và đăng bài AI"
          : "Đã tạo bài AI (nháp)"
      );
      if (data.editUrl) {
        router.push(data.editUrl);
        return;
      }
      router.refresh();
      setTimeout(() => setState("idle"), 2500);
    } catch (e) {
      setState("error");
      setMessage((e as Error).message);
      setTimeout(() => setState("idle"), 4000);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={state === "loading"}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700"
        aria-label="Chuyên mục bài AI"
      >
        <option value="">Chuyên mục (tự chọn)</option>
        {AI_CATEGORY_OPTIONS.map((code) => (
          <option key={code} value={code}>
            {NEWS_CATEGORY_LABELS[code]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleWrite}
        disabled={state === "loading"}
        title={message ?? "Tạo bài viết bằng AI theo prompt Admin"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-70",
          state === "done" && "bg-emerald-50 text-emerald-700",
          state === "error" && "bg-red-50 text-red-700",
          state !== "done" &&
            state !== "error" &&
            "bg-violet-600 text-white hover:bg-violet-500"
        )}
      >
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {state === "loading"
          ? "Đang sinh…"
          : state === "done"
            ? "Xong"
            : state === "error"
              ? "Lỗi"
              : "Tạo bài AI"}
      </button>
      {message && state === "error" ? (
        <span className="max-w-xs text-xs text-red-600" title={message}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
