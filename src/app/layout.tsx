import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SiteChrome } from "@/components/layout/site-chrome";
import { getSiteSettings } from "@/modules/admin/settings-service";
import { SETTING_DEFAULTS } from "@/modules/admin/settings-shared";
import { getSiteBaseUrl } from "@/lib/seo/site-url";
import "./globals.css";

async function loadSettings() {
  try {
    return await getSiteSettings();
  } catch {
    return SETTING_DEFAULTS;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  const name = s.site_name || "TaiChinh.vn";
  const description = s.site_description || SETTING_DEFAULTS.site_description;
  const url = await getSiteBaseUrl();

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
      images: [{ url: "/brand-wordmark.png", width: 1024, height: 410, alt: name }],
    },
    icons: {
      icon: "/logo-icon.png",
      apple: "/logo-icon.png",
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

  return (
    <html lang="vi">
      <body className="min-h-screen bg-finance-50 text-finance-900 antialiased flex flex-col">
        <SiteChrome
          siteName={s.site_name || "TaiChinh.vn"}
          siteDescription={s.site_description || SETTING_DEFAULTS.site_description}
        >
          {children}
        </SiteChrome>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
