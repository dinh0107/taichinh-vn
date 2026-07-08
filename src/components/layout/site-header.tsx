import Link from "next/link";
import Image from "next/image";
import {
  Coins,
  DollarSign,
  Landmark,
  TrendingUp,
  Fuel,
  Newspaper,
  Search,
} from "lucide-react";
import { SiteNav } from "@/components/layout/site-nav";
import { formatHeaderDateTime } from "@/lib/time";

export const NAV_ITEMS = [
  { href: "/gia-vang", label: "Giá vàng", icon: Coins },
  { href: "/ty-gia", label: "Tỷ giá", icon: DollarSign },
  { href: "/lai-suat", label: "Lãi suất", icon: Landmark },
  { href: "/chung-khoan", label: "Chứng khoán", icon: TrendingUp },
  { href: "/gia-xang", label: "Giá xăng", icon: Fuel },
  { href: "/tin-tuc", label: "Tin tức", icon: Newspaper },
] as const;

export function SiteHeader({ siteName = "TaiChinh.vn" }: { siteName?: string }) {
  const now = formatHeaderDateTime();

  return (
    <header className="sticky top-0 z-50 bg-finance-ink text-white">
      <div className="border-b border-white/5 bg-finance-900/80">
        <div className="container-page flex h-8 items-center justify-between text-[11px] text-finance-400">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-live" />
              <span className="font-semibold tracking-wide text-emerald-400/90">
                LIVE
              </span>
            </span>
            <span className="hidden text-finance-500 sm:inline">·</span>
            <span className="hidden sm:inline">Cập nhật mỗi 5 phút</span>
          </span>
          <span className="tabular-nums">{now}</span>
        </div>
      </div>

      <div className="border-b border-gold-500/30">
        <div className="container-page flex h-[58px] items-center justify-between gap-4">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="relative h-9 w-[150px] shrink-0 brightness-0 invert transition-opacity group-hover:opacity-90 sm:h-10 sm:w-[168px]">
              <Image
                src="/brand-wordmark.png"
                alt={siteName}
                fill
                sizes="168px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          <SiteNav items={[...NAV_ITEMS]} variant="desktop" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded text-finance-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Tìm kiếm"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/gia-vang"
              className="hidden rounded border border-gold-500/40 bg-gold-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-gold-400 transition hover:bg-gold-500/20 sm:inline-flex"
            >
              GIÁ VÀNG
            </Link>
          </div>
        </div>
      </div>

      <SiteNav items={[...NAV_ITEMS]} variant="mobile" />
    </header>
  );
}

export function SiteFooter({
  siteName = "TaiChinh.vn",
  siteDescription = "Nền tảng tài chính cá nhân hàng đầu Việt Nam. Giá vàng, tỷ giá, lãi suất, chứng khoán — cập nhật realtime, miễn phí.",
}: {
  siteName?: string;
  siteDescription?: string;
}) {
  return (
    <footer className="mt-auto border-t border-gold-500/20 bg-finance-ink text-finance-300">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="relative h-10 w-[180px] brightness-0 invert opacity-90">
              <Image
                src="/brand-wordmark.png"
                alt={siteName}
                fill
                sizes="180px"
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm leading-relaxed text-finance-500">
              {siteDescription}
            </p>
          </div>

          <FooterCol
            title="Giá vàng"
            links={[
              ["Giá vàng hôm nay", "/gia-vang-hom-nay"],
              ["Giá vàng SJC", "/gia-vang-sjc-hom-nay"],
              ["Giá vàng DOJI", "/gia-vang-doji-hom-nay"],
              ["Giá vàng PNJ", "/gia-vang-pnj-hom-nay"],
            ]}
          />
          <FooterCol
            title="Tỷ giá & Lãi suất"
            links={[
              ["Tỷ giá USD", "/ty-gia-usd-hom-nay"],
              ["Tỷ giá EUR", "/ty-gia-eur-hom-nay"],
              ["Lãi suất Vietcombank", "/lai-suat-vietcombank"],
              ["Lãi suất BIDV", "/lai-suat-bidv"],
            ]}
          />
          <FooterCol
            title="Khác"
            links={[
              ["Chứng khoán", "/chung-khoan"],
              ["Giá xăng", "/gia-xang"],
              ["Tin tức", "/tin-tuc"],
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 text-center text-xs text-finance-500 md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <p>Dữ liệu chỉ mang tính tham khảo, không phải lời khuyên đầu tư.</p>
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
    <div>
      <p className="label-caps mb-4 text-gold-500/80">{title}</p>
      <ul className="space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="text-finance-400 transition-colors hover:text-gold-400"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
