import Link from "next/link";
import {
  Coins,
  DollarSign,
  Fuel,
  Landmark,
  Newspaper,
} from "lucide-react";

const CTAS = [
  { href: "/gia-vang", label: "Giá vàng", icon: Coins },
  { href: "/gia-xang", label: "Giá xăng dầu", icon: Fuel },
  { href: "/ty-gia", label: "Tỷ giá USD", icon: DollarSign },
  { href: "/lai-suat", label: "Lãi suất ngân hàng", icon: Landmark },
  { href: "/tin-tuc", label: "Tin tức thị trường", icon: Newspaper },
] as const;

export function HomeHero({ description }: { description: string }) {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative min-h-[220px] overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[url('/assets/bg-home-hero.webp')] bg-cover bg-center p-5 text-white shadow-[var(--shadow-soft)] md:min-h-[300px] md:p-6"
    >
      <div className="relative flex h-full min-h-[172px] flex-col justify-center">
        <span className="inline-flex max-w-max items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium tracking-[0.04em] text-[#6EE7B7]">
          <span className="h-2 w-2 rounded-full bg-[#22c55e]" aria-hidden />
          Dữ liệu thị trường realtime
        </span>
        <h1
          id="home-hero-title"
          className="mt-4 max-w-4xl text-[24px] font-bold leading-[1.18] tracking-[-0.04em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-[30px] lg:text-[32px]"
        >
          Giá vàng hôm nay, tỷ giá USD
          <br />
          <span className="text-[#FBBF24]">và giá xăng dầu mới nhất</span>
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/95 drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)] lg:pr-[30%]">
          {description ||
            "Theo dõi giá vàng SJC, vàng 9999, DOJI, PNJ, tỷ giá ngoại tệ, giá xăng dầu và lãi suất ngân hàng được cập nhật liên tục nhanh và chính xác."}
        </p>
        <nav aria-label="Danh mục" className="mt-6">
          <div className="no-scrollbar flex flex-wrap gap-3 overflow-x-auto pb-1 pr-2 sm:overflow-visible sm:pb-0">
            {CTAS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full border border-[var(--border-soft)] bg-white px-4 text-xs font-semibold text-slate-900 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[var(--accent-blue)]"
              >
                <c.icon className="h-[18px] w-[18px] text-[var(--accent-blue)]" />
                {c.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
