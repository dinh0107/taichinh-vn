import { demoteBodyH1 } from "@/lib/seo/demote-body-h1";
import { ensureImgAlt } from "@/lib/seo/ensure-img-alt";

export function ArticleBody({
  html,
  imageAltFallback = "",
}: {
  html: string;
  /** Used when an <img> in content has no alt (e.g. article title). */
  imageAltFallback?: string;
}) {
  const safe = ensureImgAlt(demoteBodyH1(html), imageAltFallback);
  return (
    <div
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
