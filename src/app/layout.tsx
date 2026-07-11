import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SiteChrome } from "@/components/layout/site-chrome";
import { SiteScripts } from "@/components/layout/site-scripts";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { SETTING_DEFAULTS } from "@/modules/admin/settings-shared";
import { getSiteBaseUrl } from "@/lib/seo/site-url";
import "./globals.css";

/** ISR: refresh site chrome / metadata every 5 minutes (on-demand via revalidatePath). */
export const revalidate = 300;

async function loadSettings() {
  try {
    return await getSiteSettings();
  } catch {
    return SETTING_DEFAULTS;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  const name = s.site_name || SETTING_DEFAULTS.site_name;
  const description = s.site_description || SETTING_DEFAULTS.site_description;
  const url = await getSiteBaseUrl();
  const v = s.brand_asset_version || "0";
  // Serve via API so IIS never serves a stale root PNG bypassing Next.
  const icon = `/api/brand/icon?v=${v}`;
  const wordmark = `/api/brand/logo?v=${v}`;

  return {
    metadataBase: new URL(url),
    title: {
      default: `${name} — Giá vàng, Tỷ giá, Lãi suất, Chứng khoán`,
      template: `%s | ${name}`,
    },
    description,
    applicationName: name,
    keywords: [
      "giá vàng hôm nay",
      "tỷ giá usd",
      "lãi suất ngân hàng",
      "chứng khoán",
      "vnindex",
    ],
    openGraph: {
      locale: "vi_VN",
      type: "website",
      siteName: name,
      title: `${name} — Giá vàng, Tỷ giá, Lãi suất, Chứng khoán`,
      description,
      images: [{ url: wordmark, width: 1024, height: 410, alt: name }],
    },
    icons: {
      icon: [{ url: icon, type: "image/png" }],
      shortcut: icon,
      apple: [{ url: icon, type: "image/png" }],
    },
    other: {
      "msapplication-TileImage": icon,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const s = await loadSettings();
  const v = s.brand_asset_version || "0";

  return (
    <html lang="vi">
      <head>
        {/* Extra favicon links — browsers cache <link rel=icon> aggressively */}
        <link rel="icon" href={`/api/brand/icon?v=${v}`} type="image/png" />
        <link rel="apple-touch-icon" href={`/api/brand/icon?v=${v}`} />
      </head>
      <body className="min-h-screen bg-finance-50 text-finance-900 antialiased flex flex-col">
        <SiteChrome
          siteName={s.site_name || SETTING_DEFAULTS.site_name}
          siteDescription={s.site_description || SETTING_DEFAULTS.site_description}
          brandVersion={v}
        >
          {children}
        </SiteChrome>
        <SiteScripts
          headHtml={s.head_scripts || ""}
          bodyHtml={s.body_scripts || ""}
        />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
