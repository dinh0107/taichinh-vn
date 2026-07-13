import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/ui";
import { ArticleDetailView } from "@/components/news/article-detail-view";
import { getArticleByIdForAdmin } from "@/modules/news/service";

export default async function AdminArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleByIdForAdmin(id);
  if (!article) notFound();

  const isPublic = article.status === "PUBLISHED";

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Chi tiết bài viết"
        description={article.title}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {isPublic && (
              <Link
                href={`/tin-tuc/${article.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                <Eye className="h-4 w-4" /> Xem công khai
              </Link>
            )}
            <Link
              href={`/admin/bai-viet/${article.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <Pencil className="h-4 w-4" /> Sửa bài
            </Link>
          </div>
        }
      />

      <div className="-mx-5 overflow-hidden rounded-xl border border-slate-200 bg-white lg:-mx-8">
        <ArticleDetailView
          article={article}
          preview={article.status !== "PUBLISHED"}
        />
      </div>
    </div>
  );
}
