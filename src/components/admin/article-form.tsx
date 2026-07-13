"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import type { ArticleFormState } from "@/modules/admin/article-actions";
import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { NewsCategoryCode, ArticleStatus } from "@prisma/client";

const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-400">
        Đang tải trình soạn thảo…
      </div>
    ),
  }
);

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Đã đăng" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

export type ArticleFormValues = {
  title: string;
  slug: string;
  category: NewsCategoryCode;
  status: ArticleStatus;
  excerpt: string;
  content: string;
  source: string;
  sourceUrl: string;
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  isAiGenerated: boolean;
  publishedAt: string; // yyyy-MM-ddTHH:mm
};

const EMPTY: ArticleFormValues = {
  title: "",
  slug: "",
  category: "GOLD",
  status: "PUBLISHED",
  excerpt: "",
  content: "",
  source: "",
  sourceUrl: "",
  featuredImage: "",
  seoTitle: "",
  seoDescription: "",
  isAiGenerated: false,
  publishedAt: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
    >
      <Save className="h-4 w-4" />
      {pending ? "Đang lưu..." : "Lưu bài viết"}
    </button>
  );
}

export function ArticleForm({
  action,
  initialValues,
  mode,
}: {
  action: (
    prev: ArticleFormState,
    formData: FormData
  ) => Promise<ArticleFormState>;
  initialValues?: Partial<ArticleFormValues>;
  mode: "create" | "edit";
}) {
  const v = { ...EMPTY, ...initialValues };
  const [state, formAction] = useActionState<ArticleFormState, FormData>(
    action,
    { ok: false }
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/bai-viet"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Danh sách bài viết
        </Link>
        <SubmitButton />
      </div>

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Nội dung">
            <Field label="Tiêu đề" error={fe.title} required>
              <input
                name="title"
                defaultValue={v.title}
                placeholder="VD: Giá vàng SJC tăng mạnh phiên sáng"
                className={inputCls(fe.title)}
              />
            </Field>

            <Field
              label="Slug"
              error={fe.slug}
              hint="Để trống sẽ tự tạo từ tiêu đề."
            >
              <input
                name="slug"
                defaultValue={v.slug}
                placeholder="gia-vang-sjc-tang-manh"
                className={inputCls(fe.slug)}
              />
            </Field>

            <Field label="Tóm tắt" error={fe.excerpt}>
              <textarea
                name="excerpt"
                defaultValue={v.excerpt}
                rows={2}
                placeholder="Đoạn mô tả ngắn hiển thị ở danh sách tin."
                className={inputCls(fe.excerpt)}
              />
            </Field>

            <Field label="Nội dung" error={fe.content} required>
              <div
                className={
                  fe.content
                    ? "overflow-hidden rounded-lg ring-2 ring-red-100"
                    : undefined
                }
              >
                <RichTextEditor initialValue={v.content} name="content" />
              </div>
            </Field>
          </Card>

          <Card title="SEO">
            <Field label="SEO Title" error={fe.seoTitle}>
              <input
                name="seoTitle"
                defaultValue={v.seoTitle}
                className={inputCls(fe.seoTitle)}
              />
            </Field>
            <Field label="Meta Description" error={fe.seoDescription}>
              <textarea
                name="seoDescription"
                defaultValue={v.seoDescription}
                rows={2}
                className={inputCls(fe.seoDescription)}
              />
            </Field>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Xuất bản">
            <Field label="Trạng thái" error={fe.status}>
              <select
                name="status"
                defaultValue={v.status}
                className={inputCls(fe.status)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Thời gian đăng"
              error={fe.publishedAt}
              hint="Đặt thời điểm tương lai để hẹn lịch."
            >
              <input
                type="datetime-local"
                name="publishedAt"
                defaultValue={v.publishedAt}
                className={inputCls(fe.publishedAt)}
              />
            </Field>

            <label className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                name="isAiGenerated"
                defaultChecked={v.isAiGenerated}
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-400"
              />
              <span className="text-sm text-slate-700">Nội dung do AI sinh</span>
            </label>
          </Card>

          <Card title="Phân loại">
            <Field label="Danh mục" error={fe.category}>
              <select
                name="category"
                defaultValue={v.category}
                className={inputCls(fe.category)}
              >
                {Object.values(NewsCategoryCode).map((c) => (
                  <option key={c} value={c}>
                    {NEWS_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </Field>
          </Card>

          <Card title="Nguồn & Ảnh">
            <Field label="Tên nguồn" error={fe.source}>
              <input
                name="source"
                defaultValue={v.source}
                placeholder="VD: Vietstock"
                className={inputCls(fe.source)}
              />
            </Field>
            <Field label="URL nguồn" error={fe.sourceUrl}>
              <input
                name="sourceUrl"
                defaultValue={v.sourceUrl}
                placeholder="https://..."
                className={inputCls(fe.sourceUrl)}
              />
            </Field>
            <Field label="Ảnh đại diện (URL)" error={fe.featuredImage}>
              <input
                name="featuredImage"
                defaultValue={v.featuredImage}
                placeholder="https://..."
                className={inputCls(fe.featuredImage)}
              />
            </Field>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href="/admin/bai-viet"
          className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Hủy
        </Link>
        <SubmitButton />
      </div>
      <input type="hidden" name="_mode" value={mode} />
    </form>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  // Use <div>, not <label> — wrapping CKEditor/contenteditable in <label>
  // breaks focus, toolbar clicks, and typing in the article editor.
  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      ) : null}
    </div>
  );
}

function inputCls(error?: string) {
  return [
    "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors",
    error
      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
  ].join(" ");
}
