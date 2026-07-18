import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ArticleBody } from "@/components/news/article-body";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from "@/lib/seo/schema";
import { canonicalUrlSync } from "@/lib/seo/site-url";
import { formatDateVi } from "@/lib/time";
import type { InfoPageDef } from "@/modules/site/info-pages";
import { INFO_PAGES } from "@/modules/site/info-pages";
import { Clock, User } from "lucide-react";

export function InfoPageView({
  page,
  siteName,
  sitePhone,
  brandImage,
}: {
  page: InfoPageDef;
  siteName: string;
  sitePhone?: string;
  brandImage: string;
}) {
  const url = canonicalUrlSync(`/${page.slug}`);
  const updated = formatDateVi(page.updatedAt);

  const jsonLd = [
    buildOrganizationSchema(siteName, {
      image: brandImage,
      telephone: sitePhone,
      description: page.description,
    }),
    buildWebSiteSchema(siteName, { description: page.description }),
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: canonicalUrlSync("/") },
      { name: page.title, url },
    ]),
    buildWebPageSchema({
      name: page.title,
      description: page.description,
      url,
      siteName,
      dateModified: page.updatedAt,
      datePublished: page.updatedAt,
    }),
    buildArticleSchema({
      title: page.title,
      description: page.description,
      url,
      image: brandImage,
      siteName,
      authorName: page.author,
      publishedAt: page.updatedAt,
      modifiedAt: page.updatedAt,
      articleSection: "Thông tin",
    }),
  ];

  return (
    <div className="pb-8 pt-5 md:pt-6">
      <div className="container-page ">
        <JsonLdScript data={jsonLd} />

        <PageHeader
          title={page.title}
          description={page.description}
          breadcrumb={[
            { label: "Trang chủ", href: "/" },
            { label: page.title },
          ]}
          categoryLabel="Thông tin"
        />

        <div className="surface-card mb-5  mt-5flex flex-wrap items-center gap-4 px-5 py-3 text-sm text-[var(--text-secondary)]">
          <p className="inline-flex items-center gap-1.5">
            <User className="h-4 w-4 text-blue-600" aria-hidden />
            <span>
              Tác giả:{" "}
              <Link
                href="/tac-gia"
                className="font-semibold text-[var(--text-primary)] hover:text-blue-700"
              >
                {page.author}
              </Link>
            </span>
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-blue-600" aria-hidden />
            <span>
              Ngày cập nhật:{" "}
              <time dateTime={page.updatedAt} className="font-semibold text-[var(--text-primary)]">
                {updated}
              </time>
            </span>
          </p>
        </div>

        <article className="surface-card space-y-8 p-5 md:p-8">
          {page.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-3 text-lg font-bold text-[var(--text-primary)]">
                {s.heading}
              </h2>
              <ArticleBody html={s.html} imageAltFallback={page.title} />
            </section>
          ))}
          {page.slug === "lien-he" && sitePhone ? (
            <section>
              <h2 className="mb-3 text-lg font-bold text-[var(--text-primary)]">
                Điện thoại
              </h2>
              <p className="text-[var(--text-secondary)]">
                <a
                  href={`tel:${sitePhone.replace(/\s+/g, "")}`}
                  className="font-semibold text-blue-700 hover:underline"
                >
                  {sitePhone}
                </a>
              </p>
            </section>
          ) : null}
        </article>

        <nav
          aria-label="Các trang thông tin khác"
          className="mt-6 surface-card p-5"
        >
          <p className="mb-3 text-sm font-bold text-[var(--text-primary)]">
            Xem thêm
          </p>
          <ul className="flex flex-wrap gap-2">
            {INFO_PAGES.filter((p) => p.slug !== page.slug).map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${p.slug}`}
                  className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
