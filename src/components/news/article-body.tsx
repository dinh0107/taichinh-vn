import { demoteBodyH1 } from "@/lib/seo/demote-body-h1";

export function ArticleBody({ html }: { html: string }) {
  return (
    <div
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: demoteBodyH1(html) }}
    />
  );
}
