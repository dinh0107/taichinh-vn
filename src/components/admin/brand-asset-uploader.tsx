"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { uploadBrandAsset } from "@/modules/admin/settings-actions";
import type { UploadState } from "@/modules/admin/settings-shared";
import { cn } from "@/lib/utils";

const initialState: UploadState = { ok: false };

export function BrandAssetUploader({
  kind,
  label,
  hint,
  src,
  previewClassName,
  imageClassName = "object-contain",
}: {
  kind: "logo" | "favicon";
  label: string;
  hint?: string;
  src: string;
  previewClassName?: string;
  imageClassName?: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(uploadBrandAsset, initialState);
  // Start at 0 so server and client render the same src (no hydration
  // mismatch). Bump to a timestamp only after a successful upload to bust cache.
  const [version, setVersion] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lastShown = useRef<UploadState | null>(null);
  useEffect(() => {
    if (state === initialState || lastShown.current === state) return;
    lastShown.current = state;
    if (state.ok && state.version) {
      setVersion(state.version);
      setPreviewUrl(null);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(state.message ?? "Tải lên thành công");
      router.refresh();
    } else if (!state.ok && state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setFileName(file.name);
    } else {
      setPreviewUrl(null);
      setFileName(null);
    }
  }

  const displaySrc = previewUrl ?? (version > 0 ? `${src}?v=${version}` : src);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="kind" value={kind} />
      <span className="block text-sm font-medium text-slate-700">{label}</span>

      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50",
            previewClassName ?? "h-16 w-40"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displaySrc}
            alt={label}
            className={cn("h-full w-full", imageClassName)}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <UploadCloud className="h-4 w-4" />
            Chọn ảnh PNG
            <input
              ref={inputRef}
              type="file"
              name="file"
              accept="image/png"
              onChange={handleSelect}
              className="hidden"
            />
          </label>
          {fileName && (
            <p className="truncate text-xs text-slate-500" title={fileName}>
              {fileName}
            </p>
          )}
          {hint && !fileName && (
            <p className="text-xs text-slate-400">{hint}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !fileName}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadCloud className={cn("h-4 w-4", isPending && "animate-pulse")} />
          {isPending ? "Đang tải lên" : "Tải lên"}
        </button>
      </div>
    </form>
  );
}
