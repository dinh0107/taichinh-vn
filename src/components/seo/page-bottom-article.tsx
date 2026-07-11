import { ArticleBody } from "@/components/news/article-body";
import { getSeoPageContentBySlug } from "@/modules/admin/seo-service";

/** Renders SEO article body at the bottom of a public page when content exists. */
export async function PageBottomArticle({ slug }: { slug: string }) {
  const content = await getSeoPageContentBySlug(slug);
  if (!content) return null;

  return (
    <section className="overflow-hidden rounded border border-finance-200 bg-white px-5 py-6 shadow-sm md:px-8 md:py-8">
      <ArticleBody html={content} />
    </section>
  );
}
