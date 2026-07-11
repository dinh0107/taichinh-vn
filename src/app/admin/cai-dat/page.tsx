import { ImageIcon } from "lucide-react";
import { AdminPageTitle, AdminCard } from "@/components/admin/ui";
import { BrandAssetUploader } from "@/components/admin/brand-asset-uploader";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings, getSecretFlags } from "@/modules/admin/settings-service";
import { isGscEnabled } from "@/lib/gsc/feature";

export default async function AdminSettingsPage() {
  const [settings, secretFlags] = await Promise.all([
    getSiteSettings(),
    getSecretFlags(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Cài đặt"
        description="Cấu hình chung của nền tảng, API và kiếm tiền."
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
            hint="PNG vuông, khuyến nghị 512×512px, tối đa 2MB."
            previewClassName="h-16 w-16"
          />
        </div>
      </AdminCard>

      <SettingsForm
        initial={settings}
        secretFlags={secretFlags}
        gscEnabled={isGscEnabled()}
      />
    </div>
  );
}
