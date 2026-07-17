import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { SiteNavDesktop, SiteNavMobile } from "@/components/layout/site-nav";

export const NAV_ITEMS = [
  { href: "/gia-vang", label: "Giá vàng" },
  { href: "/ty-gia", label: "Tỷ giá" },
  { href: "/lai-suat", label: "Lãi suất" },
  { href: "/chung-khoan", label: "Chứng khoán" },
  { href: "/gia-xang", label: "Giá xăng" },
  { href: "/tin-tuc", label: "Tin tức" },
] as const;

export function SiteHeader({
  siteName = "Giá Hôm Nay",
  brandVersion = "0",
}: {
  siteName?: string;
  brandVersion?: string;
}) {
  const logoSrc = `/api/brand/logo?v=${brandVersion}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.1)] bg-[#050816]/95 text-[rgba(255,255,255,0.92)] backdrop-blur-2xl">
      <div className="container-page">
        <div className="flex h-14 min-w-0 items-center justify-between gap-3 sm:h-16 lg:h-[68px]">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-base font-bold tracking-tight text-[rgba(255,255,255,0.96)] sm:text-lg"
          >
            <span className="relative hidden h-8 w-[140px] sm:block sm:h-9 sm:w-[160px]">
              <Image
                src={logoSrc}
                alt={siteName}
                fill
                sizes="160px"
                className="object-contain object-left brightness-0 invert"
                priority
                unoptimized
              />
            </span>
            <span className="sm:sr-only">{siteName}</span>
          </Link>

          <div className="relative hidden min-w-0 flex-1 lg:block">
            <SiteNavDesktop />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <SiteNavMobile />
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({
  siteName = "Giá Hôm Nay",
  siteDescription = "Cổng thông tin tài chính cập nhật liên tục từ các nguồn chính thức và uy tín.",
}: {
  siteName?: string;
  siteDescription?: string;
  brandVersion?: string;
}) {
  return (
    <footer className="relative mt-12 overflow-hidden border-t border-white/20 bg-[url('/assets/bg-footer.webp')] bg-cover bg-center bg-no-repeat pb-5 pt-16 text-white">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
        aria-hidden
      />
      <div className="container-page relative z-10">
        <nav
          aria-label="Menu chân trang"
          className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-20 lg:text-left"
        >
          <FooterCol
            title="DANH MỤC"
            links={[
              ["Giá vàng", "/gia-vang"],
              ["Tỷ giá ngoại tệ", "/ty-gia"],
              ["Lãi suất ngân hàng", "/lai-suat"],
              ["Giá xăng dầu", "/gia-xang"],
              ["Tin tức thị trường", "/tin-tuc"],
            ]}
          />
          <FooterCol
            title="CÔNG CỤ"
            links={[["So sánh lãi suất ngân hàng", "/lai-suat"]]}
          />
          <FooterCol
            title="HỖ TRỢ"
            links={[
              ["Tin tức", "/tin-tuc"],
              ["Giá vàng hôm nay", "/gia-vang"],
              ["Giá xăng hôm nay", "/gia-xang"],
              ["Tỷ giá USD", "/ty-gia-usd-hom-nay"],
            ]}
          />
          <section>
            <p className="mb-5 text-sm font-bold tracking-[0.02em] text-white">
              KẾT NỐI
            </p>
            <div className="flex flex-col items-center gap-3 lg:items-start">
              <p className="max-w-xs text-sm leading-relaxed text-white/70">
                {siteDescription}
              </p>
              <div className="flex justify-center gap-3 lg:justify-start">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/80"
                  aria-hidden
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M14.1 8.1V6.6c0-.7.5-1.1 1.2-1.1h1.2V2.8c-.6-.1-1.5-.2-2.5-.2-2.5 0-4.1 1.5-4.1 4.2v1.3H7.4v3h2.5v10.3h3.2V11.1h2.7l.4-3h-3.1Z" />
                  </svg>
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/80">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/80">
                  <Phone className="h-5 w-5" />
                </span>
              </div>
            </div>
          </section>
        </nav>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-center text-xs text-white/50 md:flex-row md:text-left">
          <p>
            © {new Date().getFullYear()} {siteName}
          </p>
          <p>
            Cổng thông tin tài chính cập nhật liên tục từ các nguồn chính thức và
            uy tín.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <section>
      <p className="mb-5 text-sm font-bold tracking-[0.02em] text-white">
        {title}
      </p>
      <ul className="space-y-4">
        {links.map(([label, href]) => (
          <li key={href + label}>
            <Link
              href={href}
              className="text-sm font-medium text-white/80 transition-colors duration-200 hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
