import { ImageIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AdminPageTitle, AdminCard } from "@/components/admin/ui";
import { BrandAssetUploader } from "@/components/admin/brand-asset-uploader";
import { SettingsForm } from "@/components/admin/settings-form";
import { HomeArticleEditor } from "@/components/admin/home-article-editor";
import { getSiteSettingsFresh, getSecretFlags } from "@/modules/admin/settings-service";
import { ensureModuleHubSeoPage } from "@/modules/admin/seo-service";
import { isGscEnabled } from "@/lib/gsc/feature";

export default async function AdminSettingsPage() {
  const [settings, secretFlags, homePage] = await Promise.all([
    getSiteSettingsFresh(),
    getSecretFlags(),
    ensureModuleHubSeoPage("home"),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Cài đặt"
        description="Thương hiệu, API, AI viết bài, quảng cáo và tracking."
      />

      <AdminCard
        title="Thương hiệu"
        action={<ImageIcon className="h-4 w-4 text-slate-400" />}
      >
        <div className="grid gap-6 p-5 sm:grid-cols-2">
          <BrandAssetUploader
            kind="logo"
            label="Logo (wordmark)"
            src="/api/brand/logo"
            initialVersion={Number(settings.brand_asset_version || 0)}
            hint="PNG nền trong suốt, khuyến nghị ~1024×410px, tối đa 2MB."
            previewClassName="h-16 w-40"
          />
          <BrandAssetUploader
            kind="favicon"
            label="Favicon / icon"
            src="/api/brand/icon"
            initialVersion={Number(settings.brand_asset_version || 0)}
            hint="Bắt buộc PNG vuông ≥48×48 (khuyến nghị 512×512). Không dùng logo ngang — Google sẽ không hiện icon trên kết quả tìm kiếm."
            previewClassName="h-16 w-16"
          />
        </div>
      </AdminCard>

      {homePage ? (
        <HomeArticleEditor
          pageId={homePage.id}
          initialContent={homePage.content}
        />
      ) : (
        <AdminCard title="Bài viết trang chủ">
          <div className="flex items-start gap-3 p-5 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Chưa tạo được trang SEO «home».</p>
              <p className="mt-1 text-amber-700/90">
                Vào{" "}
                <Link href="/admin/seo" className="underline">
                  Admin → SEO
                </Link>{" "}
                bấm «Đồng bộ template», rồi quay lại đây. Nếu vẫn lỗi, kiểm tra cột{" "}
                <code className="rounded bg-amber-100 px-1">content</code> trên bảng{" "}
                <code className="rounded bg-amber-100 px-1">seo_pages</code>.
              </p>
            </div>
          </div>
        </AdminCard>
      )}

      <SettingsForm
        initial={settings}
        secretFlags={secretFlags}
        gscEnabled={isGscEnabled()}
      />
    </div>
  );
}
