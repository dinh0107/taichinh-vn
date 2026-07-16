"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Globe, KeyRound, Megaphone, Bot, Code2 } from "lucide-react";
import { AdminCard } from "@/components/admin/ui";
import { saveSettings } from "@/modules/admin/settings-actions";
import type {
  SiteSettings,
  SaveSettingsState,
} from "@/modules/admin/settings-shared";
import {
  AI_MODEL_OPTIONS,
  AI_CATEGORY_OPTIONS,
  AI_PROVIDER_OPTIONS,
} from "@/modules/admin/settings-shared";
import { NEWS_CATEGORY_LABELS } from "@/modules/admin/labels";
import { cn } from "@/lib/utils";
import type { NewsCategoryCode } from "@prisma/client";

const initialState: SaveSettingsState = { ok: false };

function Field({
  label,
  name,
  hint,
  defaultValue,
  type = "text",
  placeholder,
  textarea,
  rows = 4,
  mono,
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  hint?: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  mono?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
}) {
  const cls = cn(
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
    mono && "font-mono text-xs leading-relaxed"
  );
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={cn(cls, "resize-y")}
          spellCheck={mono ? false : undefined}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={cls}
        />
      )}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function Toggle({
  label,
  name,
  hint,
  defaultChecked,
}: {
  label: string;
  name: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start justify-between gap-4 py-2">
      <div>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-slate-200 transition-colors checked:bg-amber-500 relative after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform checked:after:translate-x-4"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  hint,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  hint?: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function SettingsForm({
  initial,
  secretFlags,
  gscEnabled = false,
}: {
  initial: SiteSettings;
  secretFlags: Record<string, boolean>;
  gscEnabled?: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveSettings, initialState);
  const lastShown = useRef<SaveSettingsState | null>(null);
  const selectedCats = new Set(
    (initial.ai_write_categories || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
  );
  const hasOpenAiKey = Boolean(secretFlags.openai_api_key);

  useEffect(() => {
    if (state === initialState || lastShown.current === state) return;
    lastShown.current = state;
    if (state.ok && state.message) {
      toast.success(state.message);
      router.refresh();
    } else if (!state.ok && state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="sticky top-2 z-10 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-900">
          Đổi tên / mô tả xong phải bấm <strong>Lưu thay đổi</strong>. Upload logo/favicon
          bấm <strong>Tải lên</strong> trong từng ô ảnh.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className={cn("h-4 w-4", isPending && "animate-pulse")} />
          {isPending ? "Đang lưu" : "Lưu thay đổi"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Thông tin chung" action={<Globe className="h-4 w-4 text-slate-400" />}>
          <div className="space-y-4 p-5">
            <Field label="Tên website" name="site_name" defaultValue={initial.site_name} />
            <Field
              label="URL công khai"
              name="site_url"
              defaultValue={initial.site_url}
              hint="Dùng cho sitemap, OpenGraph, canonical."
            />
            <Field
              label="Mô tả mặc định"
              name="site_description"
              defaultValue={initial.site_description}
              textarea
              placeholder="Mô tả ngắn dùng cho SEO, OpenGraph, meta description..."
              hint="Dùng cho meta description & OpenGraph mặc định."
            />
          </div>
        </AdminCard>

        <AdminCard title="API & Đồng bộ" action={<KeyRound className="h-4 w-4 text-slate-400" />}>
          <div className="space-y-4 p-5">
            <Field
              label="Gold API endpoint"
              name="gold_api_endpoint"
              defaultValue={initial.gold_api_endpoint}
            />
            <Field
              label="CRON_SECRET"
              name="cron_secret"
              type="password"
              placeholder={secretFlags.cron_secret ? "••••••••  (đã thiết lập)" : "Chưa thiết lập"}
              hint="Dùng cho Scheduled Task: Authorization Bearer …. Nếu Plesk không có Environment, đặt tại đây rồi Save."
            />
            <Field label="Redis URL" name="redis_url" defaultValue={initial.redis_url} />
          </div>
        </AdminCard>

        <AdminCard title="Kiếm tiền" action={<Megaphone className="h-4 w-4 text-slate-400" />}>
          <div className="space-y-4 p-5">
            <Field
              label="Google AdSense Publisher ID"
              name="adsense_publisher_id"
              defaultValue={initial.adsense_publisher_id}
              placeholder="ca-pub-xxxxxxxxxxxxxxxx"
            />
            <div className="divide-y divide-slate-100">
              <Toggle
                label="Bật Google AdSense"
                name="enable_adsense"
                defaultChecked={initial.enable_adsense === "true"}
              />
              <Toggle
                label="Bật banner quảng cáo"
                name="enable_ad_banner"
                defaultChecked={initial.enable_ad_banner === "true"}
              />
              <Toggle
                label="Bật link affiliate"
                name="enable_affiliate"
                defaultChecked={initial.enable_affiliate === "true"}
              />
            </div>
          </div>
        </AdminCard>

        {gscEnabled && (
          <AdminCard title="Google Search Console" action={<KeyRound className="h-4 w-4 text-slate-400" />}>
            <div className="space-y-4 p-5">
              <Field
                label="GSC Property URL"
                name="gsc_property_url"
                defaultValue={initial.gsc_property_url}
                placeholder="https://taichinh.vn/"
                hint="URL property trong GSC (URL-prefix phải có dấu / cuối)."
              />
              <Field
                label="Service Account Email"
                name="gsc_client_email"
                defaultValue={initial.gsc_client_email}
                placeholder="gsc-sync@project-id.iam.gserviceaccount.com"
              />
              <Field
                label="Service Account Private Key"
                name="gsc_private_key"
                type="password"
                placeholder={
                  secretFlags.gsc_private_key ? "••••••••  (đã thiết lập)" : "-----BEGIN PRIVATE KEY-----..."
                }
                hint="Để trống nếu không đổi. Service account cần quyền trên property GSC."
              />
            </div>
          </AdminCard>
        )}
      </div>

      <AdminCard title="Nội dung AI" action={<Bot className="h-4 w-4 text-slate-400" />}>
        <div className="space-y-5 p-5">
          <div
            className={cn(
              "rounded-lg border px-3 py-2.5 text-sm",
              hasOpenAiKey
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            )}
          >
            {hasOpenAiKey
              ? "Đã có API key. Key sk-or-… → OpenRouter; sk-… → OpenAI (khi provider = Tự nhận)."
              : "Chưa có API key — dán key OpenRouter (sk-or-v1…) hoặc OpenAI (sk-…) rồi Lưu."}
          </div>

          <Field
            label="API Key (OpenAI / OpenRouter)"
            name="openai_api_key"
            type="password"
            placeholder={
              hasOpenAiKey
                ? "••••••••  (đã thiết lập — để trống nếu không đổi)"
                : "sk-or-v1-... hoặc sk-..."
            }
            hint="OpenRouter: https://openrouter.ai/keys — OpenAI: platform.openai.com"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Nhà cung cấp"
              name="ai_provider"
              defaultValue={initial.ai_provider || "auto"}
              options={[...AI_PROVIDER_OPTIONS]}
              hint="Tự nhận: sk-or- → OpenRouter."
            />
            <Field
              label="Base URL (tuỳ chọn)"
              name="ai_base_url"
              defaultValue={initial.ai_base_url || ""}
              placeholder="https://openrouter.ai/api/v1"
              hint="Để trống = mặc định theo nhà cung cấp."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="Model"
              name="ai_model"
              defaultValue={initial.ai_model || "openai/gpt-4o-mini"}
              options={[...AI_MODEL_OPTIONS]}
              hint="OpenRouter dùng dạng vendor/model."
            />
            <Field
              label="Temperature"
              name="ai_temperature"
              type="number"
              min={0}
              max={2}
              step={0.1}
              defaultValue={initial.ai_temperature || "0.7"}
              hint="0 = chặt chẽ, 2 = sáng tạo."
            />
            <Field
              label="Max tokens"
              name="ai_max_tokens"
              type="number"
              min={256}
              max={8000}
              step={1}
              defaultValue={initial.ai_max_tokens || "2000"}
            />
            <Field
              label="Giờ chạy cron (0–23)"
              name="ai_cron_hour"
              type="number"
              min={0}
              max={23}
              step={1}
              defaultValue={initial.ai_cron_hour || "7"}
              hint="Giờ máy chủ — khớp Task Scheduler."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Chế độ đăng bài AI"
              name="ai_publish_mode"
              defaultValue={initial.ai_publish_mode === "PUBLISHED" ? "PUBLISHED" : "DRAFT"}
              options={[
                { value: "DRAFT", label: "Lưu nháp (duyệt tay)" },
                { value: "PUBLISHED", label: "Đăng luôn" },
              ]}
              hint="Khuyến nghị nháp đến khi ổn định chất lượng."
            />
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Chuyên mục bài tự động
              </span>
              <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 p-3">
                {AI_CATEGORY_OPTIONS.map((code) => (
                  <label
                    key={code}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <input
                      type="checkbox"
                      name="ai_write_categories"
                      value={code}
                      defaultChecked={selectedCats.has(code)}
                      className="accent-amber-500"
                    />
                    {NEWS_CATEGORY_LABELS[code as NewsCategoryCode]}
                  </label>
                ))}
              </div>
              <span className="mt-1 block text-xs text-slate-400">
                Cron chọn topic theo các chuyên mục đã tick.
              </span>
            </div>
          </div>

          <Field
            label="System prompt"
            name="ai_system_prompt"
            defaultValue={initial.ai_system_prompt}
            textarea
            rows={3}
            hint="Vai trò / giọng văn cố định cho mọi lần gọi AI."
          />
          <Field
            label="Prompt viết bài"
            name="ai_article_prompt"
            defaultValue={initial.ai_article_prompt}
            textarea
            rows={4}
            hint="Placeholder: {{topic}}, {{date}}, {{data}}."
          />

          <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
            <Toggle
              label="Tự động viết bài SEO hằng ngày"
              name="ai_auto_write"
              hint={`Cron /api/cron/ai-daily-article lúc ${initial.ai_cron_hour || "7"}:00`}
              defaultChecked={initial.ai_auto_write === "true"}
            />
            <Toggle
              label="Tự động tóm tắt tin tức"
              name="ai_auto_summarize"
              hint="Rút gọn bài crawl (vd. 24h) trước khi đăng."
              defaultChecked={initial.ai_auto_summarize === "true"}
            />
            <Toggle
              label="Tự sinh FAQ cho landing page"
              name="ai_auto_faq"
              hint="Bổ sung FAQ Schema trên trang SEO programmatic."
              defaultChecked={initial.ai_auto_faq === "true"}
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Script Google / Tracking"
        action={<Code2 className="h-4 w-4 text-slate-400" />}
      >
        <div className="space-y-4 p-5">
          <p className="text-xs leading-relaxed text-slate-500">
            Dán nguyên thẻ script từ Google (Tag Manager, Analytics, Ads, Search Console
            HTML tag…). Chỉ chạy trên trang công khai — không chạy trong Admin / Đăng nhập.
          </p>
          <Field
            label="Script trong &lt;head&gt;"
            name="head_scripts"
            defaultValue={initial.head_scripts}
            textarea
            rows={8}
            mono
            placeholder={`<!-- Google Tag Manager -->\n<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXX');</script>\n<!-- End Google Tag Manager -->`}
            hint="GTM / gtag.js / AdSense head — dán nguyên cụm HTML Google cung cấp."
          />
          <Field
            label="Script cuối &lt;body&gt;"
            name="body_scripts"
            defaultValue={initial.body_scripts}
            textarea
            rows={6}
            mono
            placeholder={`<!-- Google Tag Manager (noscript) -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`}
            hint="Thường là thẻ noscript của GTM hoặc widget chat."
          />
        </div>
      </AdminCard>

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isPending ? "Đang lưu" : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
