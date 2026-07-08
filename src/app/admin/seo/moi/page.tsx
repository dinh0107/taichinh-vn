import { AdminPageTitle } from "@/components/admin/ui";
import { SeoForm } from "@/components/admin/seo-form";
import { createSeoPage } from "@/modules/admin/seo-actions";

export default function NewSeoPage() {
  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Landing page mới"
        description="Tạo trang SEO tùy chỉnh (loại Khác) hoặc override nội dung."
      />
      <SeoForm action={createSeoPage} mode="create" />
    </div>
  );
}
