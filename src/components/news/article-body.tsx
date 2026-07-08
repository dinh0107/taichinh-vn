export function ArticleBody({ html }: { html: string }) {
  return (
    <div
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
