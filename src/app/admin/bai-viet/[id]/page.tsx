import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import prisma from "@/lib/db";
import { AdminPageTitle } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/article-form";
import { updateArticle } from "@/modules/admin/article-actions";

function toDateTimeLocal(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { id } });

  if (!article) notFound();

  const boundAction = updateArticle.bind(null, article.id);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Sửa bài viết"
        description={article.title}
        action={
          <Link
            href={`/admin/bai-viet/${article.id}/xem`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" /> Xem chi tiết
          </Link>
        }
      />
      <ArticleForm
        action={boundAction}
        mode="edit"
        initialValues={{
          title: article.title,
          slug: article.slug,
          category: article.category,
          status: article.status,
          excerpt: article.excerpt ?? "",
          content: article.content,
          source: article.source ?? "",
          sourceUrl: article.sourceUrl ?? "",
          featuredImage: article.featuredImage ?? "",
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
          isAiGenerated: article.isAiGenerated,
          publishedAt: toDateTimeLocal(article.publishedAt),
        }}
      />
    </div>
  );
}
