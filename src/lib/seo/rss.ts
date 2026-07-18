/**
 * RSS 2.0 helpers — no dependency; escape before interpolating.
 */

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Strip tags for safe RSS descriptions. */
export function plainTextSnippet(html: string, max = 280): string {
  const plain = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trimEnd()}…`;
}

export type RssItem = {
  title: string;
  link: string;
  description: string;
  guid: string;
  pubDate?: Date | null;
  category?: string | null;
};

export function buildRss2(channel: {
  title: string;
  link: string;
  description: string;
  language?: string;
  selfUrl?: string;
  items: RssItem[];
}): string {
  const lang = channel.language || "vi";
  const lastBuild = new Date().toUTCString();
  const atomSelf = channel.selfUrl
    ? `\n  <atom:link href="${escapeXml(channel.selfUrl)}" rel="self" type="application/rss+xml" />`
    : "";

  const itemsXml = channel.items
    .map((item) => {
      const pub = item.pubDate?.toUTCString();
      const cat = item.category?.trim();
      return [
        "  <item>",
        `    <title>${escapeXml(item.title)}</title>`,
        `    <link>${escapeXml(item.link)}</link>`,
        `    <guid isPermaLink="true">${escapeXml(item.guid)}</guid>`,
        `    <description>${escapeXml(item.description)}</description>`,
        pub ? `    <pubDate>${pub}</pubDate>` : "",
        cat ? `    <category>${escapeXml(cat)}</category>` : "",
        "  </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(channel.title)}</title>
  <link>${escapeXml(channel.link)}</link>
  <description>${escapeXml(channel.description)}</description>
  <language>${escapeXml(lang)}</language>
  <lastBuildDate>${lastBuild}</lastBuildDate>${atomSelf}
${itemsXml}
</channel>
</rss>
`;
}
