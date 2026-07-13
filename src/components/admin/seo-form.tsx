"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Save, ArrowLeft, AlertCircle, Plus, Trash2 } from "lucide-react";
import type { SeoFormState } from "@/modules/admin/seo-actions";
import { SEO_PAGE_TYPE_LABELS } from "@/modules/admin/labels";
import { SeoPageType } from "@prisma/client";
import { AdminCard } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
    ),
  }
);

export type SeoFormValues = {
  slug: string;
  pageType: SeoPageType;
  title: string;
  metaDescription: string;
  h1: string;
  content: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  isIndexed: boolean;
  faqs: { question: string; answer: string }[];
};

const EMPTY: SeoFormValues = {
  slug: "",
  pageType: "CUSTOM",
  title: "",
  metaDescription: "",
  h1: "",
  content: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  isIndexed: true,
  faqs: [],
};

const PAGE_TYPES = Object.keys(SEO_PAGE_TYPE_LABELS) as SeoPageType[];

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
    >
      <Save className="h-4 w-4" />
      {pending ? "Đang lưu..." : mode === "create" ? "Tạo landing page" : "Lưu thay đổi"}
    </button>
  );
}

function inputCls(error?: string) {
  return cn(
    "w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
    error ? "border-red-300" : "border-slate-200"
  );
}

export function SeoForm({
  action,
  initialValues,
  mode,
}: {
  action: (prev: SeoFormState, formData: FormData) => Promise<SeoFormState>;
  initialValues?: Partial<SeoFormValues>;
  mode: "create" | "edit";
}) {
  const v = { ...EMPTY, ...initialValues, faqs: initialValues?.faqs ?? [] };
  const [state, formAction] = useActionState<SeoFormState, FormData>(action, {
    ok: false,
  });
  const [faqs, setFaqs] = useState(v.faqs);
  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  function addFaq() {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  }

  function updateFaq(i: number, field: "question" | "answer", value: string) {
    setFaqs((prev) => prev.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)));
  }

  function removeFaq(i: number) {
    setFaqs((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="faqPayload" value={JSON.stringify(faqs)} readOnly />

      <div className="flex items-center justify-between">
        <Link
          href="/admin/seo"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>
        <SubmitButton mode={mode} />
      </div>

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <AdminCard title="Thông tin trang">
        <div className="grid gap-5 p-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Slug URL</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">/</span>
              <input
                name="slug"
                defaultValue={v.slug}
                placeholder="gia-vang-sjc-hom-nay"
                className={inputCls(fe.slug)}
              />
            </div>
            {fe.slug && <p className="mt-1 text-xs text-red-600">{fe.slug}</p>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Loại trang</span>
            <select
              name="pageType"
              defaultValue={v.pageType}
              className={inputCls(fe.pageType)}
            >
              {PAGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SEO_PAGE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-end gap-3 pb-1">
            <input
              type="checkbox"
              name="isIndexed"
              defaultChecked={v.isIndexed}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">
              Cho phép Google index (hiện trong sitemap)
            </span>
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Tiêu đề (title)</span>
            <input name="title" defaultValue={v.title} className={inputCls(fe.title)} />
            {fe.title && <p className="mt-1 text-xs text-red-600">{fe.title}</p>}
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">H1</span>
            <input name="h1" defaultValue={v.h1} className={inputCls(fe.h1)} />
            {fe.h1 && <p className="mt-1 text-xs text-red-600">{fe.h1}</p>}
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Meta description</span>
            <textarea
              name="metaDescription"
              rows={3}
              defaultValue={v.metaDescription}
              className={cn(inputCls(fe.metaDescription), "resize-y")}
            />
            {fe.metaDescription && (
              <p className="mt-1 text-xs text-red-600">{fe.metaDescription}</p>
            )}
          </label>
        </div>
      </AdminCard>

      <AdminCard title="Nội dung chi tiết (cuối trang)">
        <div className="space-y-2 p-5">
          <p className="text-xs text-slate-500">
            Chỉ cần nội dung bài — hiện ở cuối trang công khai tương ứng với slug này.
          </p>
          <RichTextEditor initialValue={v.content} name="content" />
        </div>
      </AdminCard>

      <AdminCard title="Open Graph & Canonical">
        <div className="grid gap-5 p-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Canonical URL</span>
            <input
              name="canonicalUrl"
              defaultValue={v.canonicalUrl}
              placeholder="https://taichinh.vn/gia-vang-sjc-hom-nay"
              className={inputCls(fe.canonicalUrl)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">OG Title</span>
            <input name="ogTitle" defaultValue={v.ogTitle} className={inputCls()} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">OG Image URL</span>
            <input name="ogImage" defaultValue={v.ogImage} className={inputCls(fe.ogImage)} />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">OG Description</span>
            <textarea
              name="ogDescription"
              rows={2}
              defaultValue={v.ogDescription}
              className={cn(inputCls(), "resize-y")}
            />
          </label>
        </div>
      </AdminCard>

      <AdminCard
        title="FAQ (Schema.org)"
        action={
          <button
            type="button"
            onClick={addFaq}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm FAQ
          </button>
        }
      >
        <div className="space-y-4 p-5">
          {faqs.length === 0 ? (
            <p className="text-sm text-slate-400">
              Chưa có FAQ. Thêm câu hỏi để tăng cơ hội hiện featured snippet.
            </p>
          ) : (
            faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    FAQ #{i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  value={faq.question}
                  onChange={(e) => updateFaq(i, "question", e.target.value)}
                  placeholder="Câu hỏi"
                  className={inputCls()}
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(i, "answer", e.target.value)}
                  rows={2}
                  placeholder="Câu trả lời"
                  className={cn(inputCls(), "resize-y")}
                />
              </div>
            ))
          )}
        </div>
      </AdminCard>
    </form>
  );
}
