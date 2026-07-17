import Link from "next/link";
import { formatNumber, cn } from "@/lib/utils";
import { fxDetailHref, fuelDetailHref } from "@/lib/seo/detail-links";

type Rate = { buy: number; sell: number; ch: number };
type FuelRow = {
  code: string;
  type: string;
  price: number;
  change: number;
  zone1?: number;
  zone2?: number;
};

export function HomeSidebar({
  forex,
  fuels,
}: {
  forex: Record<string, Rate> | undefined;
  fuels: FuelRow[];
}) {
  const currencies = ["USD", "EUR", "GBP", "JPY", "CNY"] as const;

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <section className="ui-card p-4">
        <div className="mb-3 space-y-1">
          <p className="text-sm font-bold uppercase tracking-wide text-[#02050e]">
            Giá dầu thô thế giới
          </p>
        </div>
        <ul className="space-y-2">
          {[
            { name: "WTI", href: "/gia-xang" },
            { name: "Brent", href: "/gia-xang" },
          ].map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="block rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2.5 text-[#02050e] transition duration-200 hover:border-blue-600/25 hover:bg-blue-600/5 hover:text-blue-600"
              >
                <p className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 text-sm font-semibold">
                  <span className="text-left text-[#02050e]">{item.name}</span>
                  <span className="justify-self-end whitespace-nowrap text-[var(--text-muted)]">
                    —
                  </span>
                  <span className="justify-self-end whitespace-nowrap text-[var(--text-muted)]">
                    —
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-right text-xs text-[#6b7280]">
          Đơn vị: USD · chưa có nguồn realtime
        </p>
      </section>

      <section className="ui-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-bold uppercase tracking-wide text-[#02050e]">
            Tỷ giá Vietcombank
          </p>
          <Link
            href="/ty-gia"
            className="text-[11px] font-semibold text-blue-600 hover:underline"
          >
            Chi tiết
          </Link>
        </div>
        <div className="mb-2 hidden grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] md:grid">
          <span>Ngoại tệ</span>
          <span className="text-right md:min-w-[62px]">Mua vào</span>
          <span className="text-right md:min-w-[62px]">Bán ra</span>
        </div>
        <ul className="space-y-2">
          {currencies.map((code) => {
            const r = forex?.[code];
            if (!r) return null;
            const dec = r.buy < 100 ? 2 : 0;
            return (
              <li key={code}>
                <Link
                  href={fxDetailHref(code) ?? "/ty-gia"}
                  className="block rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2.5 transition duration-200 hover:border-blue-600/25 hover:bg-blue-600/5"
                >
                  <p className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 text-sm">
                    <span className="text-left font-semibold text-[#02050e]">
                      {code}
                    </span>
                    <span className="data-value justify-self-end whitespace-nowrap text-right font-semibold text-[var(--accent-red)] md:min-w-[62px]">
                      {formatNumber(r.buy, dec)}
                    </span>
                    <span className="data-value justify-self-end whitespace-nowrap text-right font-semibold text-emerald-600 md:min-w-[62px]">
                      {formatNumber(r.sell, dec)}
                    </span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-right text-xs text-[#6b7280]">Đơn vị: VND</p>
      </section>

      <section className="ui-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-bold uppercase tracking-wide text-[#02050e]">
            Giá bán lẻ xăng dầu
          </p>
          <Link
            href="/gia-xang"
            className="text-[11px] font-semibold text-blue-600 hover:underline"
          >
            Chi tiết
          </Link>
        </div>
        <div className="mb-2 hidden grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] md:grid">
          <span>Sản phẩm</span>
          <span className="text-right">Vùng 1</span>
          <span className="text-right">Vùng 2</span>
        </div>
        <ul className="space-y-2">
          {fuels.slice(0, 8).map((f) => {
            const z1 = f.zone1 ?? f.price;
            const z2 = f.zone2 ?? f.price;
            const down = f.change < 0;
            return (
              <li key={f.code}>
                <Link
                  href={fuelDetailHref(f.code) ?? "/gia-xang"}
                  className="block rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2.5 transition duration-200 hover:border-blue-600/25 hover:bg-blue-600/5"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-2 text-sm">
                    <span className="min-w-0 text-[13px] font-medium leading-snug text-slate-700">
                      {f.type}
                    </span>
                    <span
                      className={cn(
                        "data-value min-w-[3.5rem] text-right text-[13px] font-bold",
                        down ? "text-[var(--accent-red)]" : "text-slate-900"
                      )}
                    >
                      {formatNumber(z1)}
                    </span>
                    <span
                      className={cn(
                        "data-value min-w-[3.5rem] text-right text-[13px] font-bold",
                        down ? "text-[var(--accent-red)]" : "text-slate-900"
                      )}
                    >
                      {formatNumber(z2)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-right text-xs text-[#6b7280]">Đơn vị: VND</p>
      </section>
    </aside>
  );
}
