/**
 * Page chrome owns the single <h1>. Demote any <h1> in rich HTML to <h2>
 * so scraped/AI/editor content never creates a second H1.
 */
export function demoteBodyH1(html: string): string {
  if (!html || !/<h1\b/i.test(html)) return html;
  return html
    .replace(/<\s*h1(\s[^>]*)?>/gi, "<h2$1>")
    .replace(/<\s*\/\s*h1\s*>/gi, "</h2>");
}
