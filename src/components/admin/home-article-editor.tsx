"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { FileText, Save } from "lucide-react";
import { AdminCard } from "@/components/admin/ui";
import {
  saveHomePageArticle,
  type SeoFormState,
} from "@/modules/admin/seo-actions";

const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
    ),
  }
);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
    >
      <Save className="h-4 w-4" />
      {pending ? "Đang lưu..." : "Lưu bài trang chủ"}
    </button>
  );
}

export function HomeArticleEditor({
  pageId,
  initialContent,
}: {
  pageId: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [state, formAction] = useActionState<SeoFormState, FormData>(
    saveHomePageArticle,
    { ok: false }
  );

  useEffect(() => {
    if (state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <AdminCard
      title="Bài viết trang chủ"
      action={<FileText className="h-4 w-4 text-slate-400" />}
    >
      <form action={formAction} className="space-y-4 p-5">
        <input type="hidden" name="id" value={pageId} />
        <input type="hidden" name="content" value={content} readOnly />

        <p className="text-xs text-slate-500">
          Nội dung hiện ở cuối trang chủ (/). Có thể chỉnh thêm meta / FAQ tại{" "}
          <Link href={`/admin/seo/${pageId}`} className="text-amber-700 underline">
            SEO → Trang chủ
          </Link>
          .
        </p>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </AdminCard>
  );
}
