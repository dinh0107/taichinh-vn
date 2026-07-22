import Link from "next/link";
import { Plus, FileText, Sparkles, Eye, Pencil, ExternalLink } from "lucide-react";
import {
  AdminPageTitle,
  AdminCard,
  Badge,
  StatCard,
  EmptyState,
} from "@/components/admin/ui";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";
import { AiWriteArticleButton } from "@/components/admin/ai-write-article-button";
import { getArticles, getArticleStats } from "@/modules/admin/service";
import {
  NEWS_CATEGORY_LABELS,
  ARTICLE_STATUS_LABELS,
} from "@/modules/admin/labels";
import { formatDateVi } from "@/lib/time";
import type { ArticleStatus } from "@prisma/client";
import { withHtmlExtension } from "@/lib/seo/html-path";

const CATEGORY_TONE: Record<string, "amber" | "violet" | "sky" | "emerald" | "slate"> = {
  GOLD: "amber",
  STOCKS: "violet",
  BANKING: "sky",
  REAL_ESTATE: "emerald",
  ECONOMY: "slate",
  GENERAL: "slate",
};

function resolveArticleStatus(
  status: ArticleStatus,
  publishedAt: Date | null
): keyof typeof ARTICLE_STATUS_LABELS {
  if (
    status === "PUBLISHED" &&
    publishedAt &&
    publishedAt.getTime() > Date.now()
  ) {
    return "SCHEDULED";
  }
  return status;
}

export default async function AdminArticlesPage() {
  const [articles, stats] = await Promise.all([
    getArticles(),
    getArticleStats(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Quản lý bài viết"
        description="Bài viết tổng hợp và nội dung do AI tự sinh."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <AiWriteArticleButton />
            <Link
              href="/admin/bai-viet/moi"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" /> Bài viết mới
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng bài viết"
          value={String(stats.total)}
          icon={FileText}
          accent="violet"
        />
        <StatCard
          label="Đã đăng"
          value={String(stats.published)}
          icon={Eye}
          accent="emerald"
        />
        <StatCard
          label="Sinh bởi AI"
          value={String(stats.aiCount)}
          icon={Sparkles}
          accent="amber"
        />
        <StatCard
          label="Tổng lượt xem"
          value={stats.totalViews > 0 ? stats.totalViews.toLocaleString() : "—"}
          icon={Eye}
          accent="sky"
        />
      </div>

      <AdminCard title="Danh sách bài viết">
        {articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Tiêu đề</th>
                  <th className="px-5 py-3 text-left font-semibold">Danh mục</th>
                  <th className="px-5 py-3 text-center font-semibold">Nguồn</th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Ngày</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((a) => {
                  const uiStatus = resolveArticleStatus(
                    a.status,
                    a.publishedAt
                  );
                  const statusMeta = ARTICLE_STATUS_LABELS[uiStatus];
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60">
                      <td className="max-w-md px-5 py-3.5">
                        <p className="truncate font-medium text-slate-900">
                          {a.title}
                        </p>
                        <p className="text-xs text-slate-400">/{a.slug}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={CATEGORY_TONE[a.category] ?? "slate"}>
                          {NEWS_CATEGORY_LABELS[a.category]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {a.isAiGenerated ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <Sparkles className="h-3 w-3" /> AI
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Thủ công
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Badge tone={statusMeta.tone}>
                          {statusMeta.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatDateVi(a.publishedAt ?? a.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/bai-viet/${a.id}/xem`}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-sky-600"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {a.status === "PUBLISHED" && (
                            <Link
                              href={withHtmlExtension(`/tin-tuc/${a.slug}`)}
                              target="_blank"
                              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600"
                              title="Xem trang công khai"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/bai-viet/${a.id}`}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <DeleteArticleButton id={a.id} title={a.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Chưa có bài viết nào trong database." />
        )}
      </AdminCard>
    </div>
  );
}
