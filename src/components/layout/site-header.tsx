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

const NAV_ITEMS = [
  { href: "/gia-vang", label: "Giá vàng", icon: Coins },
  { href: "/ty-gia", label: "Tỷ giá", icon: DollarSign },
  { href: "/lai-suat", label: "Lãi suất", icon: Landmark },
  { href: "/chung-khoan", label: "Chứng khoán", icon: TrendingUp },
  { href: "/gia-xang", label: "Giá xăng", icon: Fuel },
  { href: "/tin-tuc", label: "Tin tức", icon: Newspaper },
];

export function SiteHeader({ siteName = "TaiChinh.vn" }: { siteName?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-11 w-[176px] transition-transform group-hover:scale-[1.01]">
            <Image
              src="/brand-wordmark.png"
              alt={siteName}
              fill
              sizes="176px"
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Tìm kiếm"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <Link
            href="/gia-vang"
            className="hidden sm:inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Bắt đầu
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="lg:hidden flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 no-scrollbar">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        ))}
      </nav>
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
    <footer className="mt-auto border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
          <div className="relative h-12 w-[200px] overflow-hidden">
            <Image
              src="/brand-wordmark.png"
              alt={siteName}
              fill
              sizes="200px"
              className="object-contain"
            />
          </div>
            <p className="text-sm text-slate-400 leading-relaxed">
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-center text-sm text-slate-500 md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} {siteName} — Mọi quyền được bảo lưu.</p>
          <p className="text-xs">
            Dữ liệu chỉ mang tính tham khảo, không phải lời khuyên đầu tư.
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
    <div>
      <p className="font-semibold text-white mb-4">{title}</p>
      <ul className="space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="text-slate-400 hover:text-amber-400 transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
