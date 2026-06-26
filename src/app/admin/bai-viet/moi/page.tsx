import { AdminPageTitle } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/article-form";
import { createArticle } from "@/modules/admin/article-actions";

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Bài viết mới"
        description="Tạo và xuất bản bài viết mới."
      />
      <ArticleForm action={createArticle} mode="create" />
    </div>
  );
}
