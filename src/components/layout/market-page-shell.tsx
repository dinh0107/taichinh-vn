import { HomeLeftNav } from "@/components/home/home-left-nav";
import { HomeMarketTabs } from "@/components/home/home-market-tabs";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { getForexRatesByBank } from "@/modules/forex/service";
import { getFuelPrices } from "@/modules/fuel/service";
import { cn } from "@/lib/utils";

type Rate = { buy: number; sell: number; ch: number };

/**
 * GHN-style market layout:
 * - xl+: left sticky nav + main + right widgets (default)
 * - news: main + right widgets only
 */
export async function MarketPageShell({
  children,
  variant = "triple",
  className,
}: {
  children: React.ReactNode;
  variant?: "triple" | "news";
  className?: string;
}) {
  const [forexRates, fuels] = await Promise.all([
    getForexRatesByBank(),
    getFuelPrices(),
  ]);

  const vcb = forexRates.find((b) =>
    b.bankName.toLowerCase().includes("vietcombank")
  );
  const forex = (vcb?.rates ?? forexRates[0]?.rates) as
    | Record<string, Rate>
    | undefined;

  return (
    <div className={cn("pb-8 pt-5 md:pt-6", className)}>
      <div className="container-page">
        <HomeMarketTabs />

        <div
          className={cn(
            "grid gap-5",
            variant === "news"
              ? "xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_360px]"
              : "xl:grid-cols-[240px_minmax(0,1fr)_340px] 2xl:grid-cols-[248px_minmax(0,1fr)_360px]"
          )}
        >
          {variant === "triple" && <HomeLeftNav />}

          <div className="min-w-0 space-y-5">{children}</div>

          <div className="min-w-0">
            <HomeSidebar forex={forex} fuels={fuels} />
          </div>
        </div>
      </div>
    </div>
  );
}
