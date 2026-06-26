"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoldLineChart } from "./gold-line-chart";
import { GoldCandlestickChart } from "./gold-candlestick-chart";
import type { HistoryRange } from "../types";

const RANGES: { value: HistoryRange; label: string }[] = [
  { value: "1d", label: "Hôm nay" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "90d", label: "90 ngày" },
  { value: "1y", label: "1 năm" },
  { value: "all", label: "Tất cả" },
];

type Props = {
  code: string;
  currency?: "VND" | "USD";
  initialData: { buy: number; sell: number; recordedAt: string }[];
  initialRange?: HistoryRange;
};

export function GoldChartSection({
  code,
  currency = "VND",
  initialData,
  initialRange = "30d",
}: Props) {
  const [range, setRange] = useState<HistoryRange>(initialRange);
  const [data, setData] = useState(
    initialData.map((d) => ({ ...d, recordedAt: new Date(d.recordedAt) }))
  );
  const [loading, setLoading] = useState(false);

  async function loadRange(newRange: HistoryRange) {
    setRange(newRange);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/gold/history?code=${code}&range=${newRange}`);
      const json = await res.json();
      if (json.success) {
        setData(
          json.data.map((d: { buy: number; sell: number; recordedAt: string }) => ({
            ...d,
            recordedAt: new Date(d.recordedAt),
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => loadRange(r.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              range === r.value
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <Tabs defaultValue="line">
        <TabsList>
          <TabsTrigger value="line">Biểu đồ đường</TabsTrigger>
          <TabsTrigger value="candle">Nến (Candlestick)</TabsTrigger>
        </TabsList>
        <TabsContent value="line">
          {loading ? (
            <div className="flex h-[360px] items-center justify-center text-slate-400">
              Đang tải...
            </div>
          ) : (
            <GoldLineChart data={data} currency={currency} />
          )}
        </TabsContent>
        <TabsContent value="candle">
          {loading ? (
            <div className="flex h-[360px] items-center justify-center text-slate-400">
              Đang tải...
            </div>
          ) : (
            <GoldCandlestickChart data={data} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
