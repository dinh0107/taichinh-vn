"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
} from "lightweight-charts";

type DataPoint = {
  recordedAt: Date | string;
  buy: number;
  sell: number;
  openBuy?: number;
  highBuy?: number;
  lowBuy?: number;
};

type Props = {
  data: DataPoint[];
  height?: number;
};

export function GoldCandlestickChart({ data, height = 360 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#334155",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      timeScale: { borderColor: "#e2e8f0" },
      rightPriceScale: { borderColor: "#e2e8f0" },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#059669",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#059669",
      wickDownColor: "#dc2626",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        chart.applyOptions({ width: entries[0].contentRect.width });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    const candleData = data.map((d, i) => {
      const prev = data[i - 1];
      const open = d.openBuy ?? prev?.buy ?? d.buy;
      const high = d.highBuy ?? Math.max(open, d.buy, d.sell);
      const low = d.lowBuy ?? Math.min(open, d.buy, d.sell);
      const close = d.buy;
      const time = Math.floor(new Date(d.recordedAt).getTime() / 1000) as import("lightweight-charts").UTCTimestamp;

      return { time, open, high, low, close };
    });

    seriesRef.current.setData(candleData);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={containerRef} className="w-full" />;
}
