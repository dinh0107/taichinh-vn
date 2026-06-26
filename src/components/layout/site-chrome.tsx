"use client";

import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/site-header";

export function SiteChrome({
  children,
  siteName,
  siteDescription,
}: {
  children: React.ReactNode;
  siteName?: string;
  siteDescription?: string;
}) {
  const pathname = usePathname();
  const isBare = pathname?.startsWith("/admin") || pathname === "/dang-nhap";

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader siteName={siteName} />
      <main className="flex-1">{children}</main>
      <SiteFooter siteName={siteName} siteDescription={siteDescription} />
    </>
  );
}
