import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SiteChrome } from "@/components/layout/site-chrome";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { SETTING_DEFAULTS } from "@/modules/admin/settings-shared";
import { getSiteBaseUrl } from "@/lib/seo/site-url";
import "./globals.css";

/** Pick up admin settings / brand uploads without full rebuild. */
export const revalidate = 60;

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
  const icon = `/logo-icon.png?v=${v}`;
  const wordmark = `/brand-wordmark.png?v=${v}`;

  return {
    metadataBase: new URL(url),
    title: {
      default: `${name} — Giá vàng, Tỷ giá, Lãi suất, Chứng khoán`,
      template: `%s | ${name}`,
    },
    description,
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
      <body className="min-h-screen bg-finance-50 text-finance-900 antialiased flex flex-col">
        <SiteChrome
          siteName={s.site_name || SETTING_DEFAULTS.site_name}
          siteDescription={s.site_description || SETTING_DEFAULTS.site_description}
          brandVersion={v}
        >
          {children}
        </SiteChrome>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
