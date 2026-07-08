import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/ui";
import { SeoForm } from "@/components/admin/seo-form";
import { updateSeoPage } from "@/modules/admin/seo-actions";
import { getSeoPageById } from "@/modules/admin/seo-service";

export default async function EditSeoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getSeoPageById(id);
  if (!page) notFound();

  const boundAction = updateSeoPage.bind(null, page.id);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Sửa landing page"
        description={`/${page.slug}`}
      />
      <SeoForm
        action={boundAction}
        mode="edit"
        initialValues={{
          slug: page.slug,
          pageType: page.pageType,
          title: page.title,
          metaDescription: page.metaDescription,
          h1: page.h1,
          canonicalUrl: page.canonicalUrl ?? "",
          ogTitle: page.ogTitle ?? "",
          ogDescription: page.ogDescription ?? "",
          ogImage: page.ogImage ?? "",
          isIndexed: page.isIndexed,
          faqs: page.faqs.map((f) => ({
            question: f.question,
            answer: f.answer,
          })),
        }}
      />
    </div>
  );
}
