"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatNumber, formatUsd } from "@/lib/utils";

type DataPoint = {
  recordedAt: Date | string;
  buy: number;
  sell: number;
};

type Props = {
  data: DataPoint[];
  currency?: "VND" | "USD";
  height?: number;
};

export function GoldLineChart({ data, currency = "VND", height = 360 }: Props) {
  const chartData = data.map((d) => ({
  ...d,
    date: format(new Date(d.recordedAt), "dd/MM", { locale: vi }),
    buy: Number(d.buy),
    sell: Number(d.sell),
  }));

  const formatter = (value: number) =>
    currency === "USD" ? formatUsd(value) : `${formatNumber(value / 1e6, 1)}tr`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis
          tickFormatter={formatter}
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          width={70}
          domain={["auto", "auto"]}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value, name) => {
            const num = Number(value ?? 0);
            return [
              currency === "USD" ? formatUsd(num) : formatNumber(num) + " đ",
              name === "buy" ? "Mua vào" : "Bán ra",
            ];
          }}
          labelFormatter={(label) => `Ngày ${label}`}
        />
        <Legend
          formatter={(value) => (value === "buy" ? "Mua vào" : "Bán ra")}
        />
        <Line
          type="monotone"
          dataKey="buy"
          stroke="#d97706"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="sell"
          stroke="#059669"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
