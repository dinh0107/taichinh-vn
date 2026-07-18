/**
 * Ensure every <img> in rich HTML has an alt attribute (a11y + SEO).
 * Missing alt → use fallback, or empty string if decorative-looking.
 */
export function ensureImgAlt(html: string, fallback = ""): string {
  if (!html || !/<img\b/i.test(html)) return html;

  return html.replace(/<img\b([^>]*)>/gi, (tag, attrs: string) => {
    if (/\balt\s*=/i.test(attrs)) {
      // Normalize empty/whitespace-only alt when we have a real fallback
      if (fallback && /\balt\s*=\s*(["'])\s*\1/i.test(attrs)) {
        return `<img${attrs.replace(/\balt\s*=\s*(["'])\s*\1/i, `alt=$1${escapeAttr(fallback)}$1`)}>`;
      }
      return tag;
    }
    const alt = fallback ? escapeAttr(fallback) : "";
    return `<img alt="${alt}"${attrs}>`;
  });
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}
