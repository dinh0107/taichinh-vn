"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Save, Globe, KeyRound, Megaphone, Bot } from "lucide-react";
import { AdminCard } from "@/components/admin/ui";
import { saveSettings } from "@/modules/admin/settings-actions";
import type {
  SiteSettings,
  SaveSettingsState,
} from "@/modules/admin/settings-shared";
import { cn } from "@/lib/utils";

const initialState: SaveSettingsState = { ok: false };

function Field({
  label,
  name,
  hint,
  defaultValue,
  type = "text",
  placeholder,
  textarea,
}: {
  label: string;
  name: string;
  hint?: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={cn(cls, "resize-y")}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
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

export function SettingsForm({
  initial,
  secretFlags,
  gscEnabled = false,
}: {
  initial: SiteSettings;
  secretFlags: Record<string, boolean>;
  gscEnabled?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(saveSettings, initialState);
  const lastShown = useRef<SaveSettingsState | null>(null);

  useEffect(() => {
    if (state === initialState || lastShown.current === state) return;
    lastShown.current = state;
    if (state.ok && state.message) toast.success(state.message);
    else if (!state.ok && state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
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
              hint="Bảo vệ các endpoint /api/cron/*. Để trống nếu không đổi."
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

        <AdminCard title="Nội dung AI" action={<Bot className="h-4 w-4 text-slate-400" />}>
          <div className="space-y-4 p-5">
            <Field
              label="OpenAI API Key"
              name="openai_api_key"
              type="password"
              placeholder={secretFlags.openai_api_key ? "••••••••  (đã thiết lập)" : "sk-..."}
              hint="Để trống nếu không đổi."
            />
            <div className="divide-y divide-slate-100">
              <Toggle
                label="Tự động viết bài SEO hằng ngày"
                name="ai_auto_write"
                hint="Chạy lúc 7:00 mỗi ngày"
                defaultChecked={initial.ai_auto_write === "true"}
              />
              <Toggle
                label="Tự động tóm tắt tin tức"
                name="ai_auto_summarize"
                defaultChecked={initial.ai_auto_summarize === "true"}
              />
              <Toggle
                label="Tự sinh FAQ cho landing page"
                name="ai_auto_faq"
                defaultChecked={initial.ai_auto_faq === "true"}
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
    </form>
  );
}
