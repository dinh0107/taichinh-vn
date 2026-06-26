import Link from "next/link";
import { getCurrentGoldPrices } from "@/modules/gold/service";
import { GoldPriceCards } from "@/modules/gold/components/gold-price-table";
import { formatNumber, formatUsd } from "@/lib/utils";
import {
  Coins,
  DollarSign,
  Landmark,
  TrendingUp,
  Fuel,
  Newspaper,
  ArrowRight,
  Sparkles,
  TrendingDown,
} from "lucide-react";

export const revalidate = 300;

const MODULES = [
  { href: "/gia-vang", icon: Coins, title: "Giá vàng", desc: "SJC, DOJI, PNJ, 9999, 24K", color: "from-amber-400 to-amber-600" },
  { href: "/ty-gia", icon: DollarSign, title: "Tỷ giá", desc: "USD, EUR, JPY — 4 ngân hàng", color: "from-emerald-400 to-emerald-600" },
  { href: "/lai-suat", icon: Landmark, title: "Lãi suất", desc: "So sánh 7 ngân hàng lớn", color: "from-sky-400 to-sky-600" },
  { href: "/chung-khoan", icon: TrendingUp, title: "Chứng khoán", desc: "VNINDEX, HNX, UPCOM", color: "from-violet-400 to-violet-600" },
  { href: "/gia-xang", icon: Fuel, title: "Giá xăng", desc: "RON95, E5, Diesel", color: "from-rose-400 to-rose-600" },
  { href: "/tin-tuc", icon: Newspaper, title: "Tin tức", desc: "Vàng, CK, ngân hàng, BĐS", color: "from-slate-500 to-slate-700" },
];

export default async function HomePage() {
  const goldPrices = await getCurrentGoldPrices();
  const sjc = goldPrices.find((p) => p.code === "SJL1L10");
  const world = goldPrices.find((p) => p.code === "XAUUSD");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-gold-radial" />
        <div className="container-page relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              Cập nhật realtime mỗi 5 phút
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-6xl">
              Tài chính cá nhân{" "}
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                Việt Nam
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
              Giá vàng, tỷ giá, lãi suất ngân hàng, chứng khoán — tất cả ở một
              nơi, chính xác và miễn phí.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/gia-vang"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.03]"
              >
                Xem giá vàng <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/ty-gia"
                className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                Tỷ giá hôm nay
              </Link>
            </div>
          </div>

          {/* Live mini-ticker */}
          <div className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3">
            <TickerCard
              label="Vàng SJC"
              value={sjc ? formatNumber(sjc.sell) + "đ" : "—"}
              change={sjc?.changeSell ?? 0}
            />
            <TickerCard
              label="Vàng thế giới"
              value={world ? formatUsd(world.buy) : "—"}
              change={world?.changeBuy ?? 0}
              isUsd
            />
            <TickerCard label="USD/VND" value="25.780" change={15} />
          </div>
        </div>
      </section>

      <div className="container-page space-y-16 py-16">
        {/* Gold snapshot */}
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Giá vàng hôm nay
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Cập nhật {new Date().toLocaleString("vi-VN")}
              </p>
            </div>
            <Link
              href="/gia-vang"
              className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:gap-2 transition-all"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <GoldPriceCards prices={goldPrices} />
        </section>

        {/* Modules */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-slate-900">Khám phá</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod) => (
              <Link key={mod.href} href={mod.href}>
                <div className="card-hover group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${mod.color} text-white shadow-md`}
                  >
                    <mod.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">{mod.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-amber-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick search */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8">
          <h2 className="text-lg font-bold text-slate-900">Tra cứu nhanh</h2>
          <p className="mt-1 text-sm text-slate-500">
            Các trang được tìm kiếm nhiều nhất
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["Giá vàng hôm nay", "gia-vang-hom-nay"],
              ["Giá vàng SJC", "gia-vang-sjc-hom-nay"],
              ["Giá vàng DOJI", "gia-vang-doji-hom-nay"],
              ["Giá vàng PNJ", "gia-vang-pnj-hom-nay"],
              ["Giá vàng 9999", "gia-vang-9999-hom-nay"],
              ["Tỷ giá USD", "ty-gia-usd-hom-nay"],
              ["Lãi suất Vietcombank", "lai-suat-vietcombank"],
            ].map(([label, slug]) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function TickerCard({
  label,
  value,
  change,
  isUsd,
}: {
  label: string;
  value: string;
  change: number;
  isUsd?: boolean;
}) {
  const isUp = change > 0;
  const isDown = change < 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-white">
        {value}
      </p>
      <p
        className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
          isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-slate-400"
        }`}
      >
        {isUp ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : isDown ? (
          <TrendingDown className="h-3.5 w-3.5" />
        ) : null}
        {isUsd
          ? formatUsd(Math.abs(change))
          : formatNumber(Math.abs(change)) + "đ"}
      </p>
    </div>
  );
}
