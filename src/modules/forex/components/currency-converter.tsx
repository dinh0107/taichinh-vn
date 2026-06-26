"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { formatNumber } from "@/lib/utils";

const RATES_TO_VND: Record<string, { name: string; flag: string; rate: number }> = {
  USD: { name: "Đô la Mỹ", flag: "🇺🇸", rate: 25780 },
  EUR: { name: "Euro", flag: "🇪🇺", rate: 28350 },
  GBP: { name: "Bảng Anh", flag: "🇬🇧", rate: 32650 },
  JPY: { name: "Yên Nhật", flag: "🇯🇵", rate: 171 },
  CNY: { name: "Nhân dân tệ", flag: "🇨🇳", rate: 3580 },
  KRW: { name: "Won Hàn", flag: "🇰🇷", rate: 18.7 },
  VND: { name: "Việt Nam Đồng", flag: "🇻🇳", rate: 1 },
};

export function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("VND");

  const num = parseFloat(amount) || 0;
  const result = (num * RATES_TO_VND[from].rate) / RATES_TO_VND[to].rate;

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-900">Quy đổi tiền tệ</h2>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Số tiền
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold tabular-nums outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-sm font-semibold outline-none focus:border-amber-400"
            >
              {Object.entries(RATES_TO_VND).map(([code, c]) => (
                <option key={code} value={code}>
                  {c.flag} {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={swap}
          className="mb-0.5 flex h-10 w-10 items-center justify-center self-end rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
          aria-label="Đảo chiều"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </button>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Quy đổi sang
          </label>
          <div className="flex gap-2">
            <div className="flex w-full items-center rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-bold tabular-nums text-amber-700">
              {formatNumber(result, to === "VND" ? 0 : 2)}
            </div>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-sm font-semibold outline-none focus:border-amber-400"
            >
              {Object.entries(RATES_TO_VND).map(([code, c]) => (
                <option key={code} value={code}>
                  {c.flag} {code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        1 {from} = {formatNumber(RATES_TO_VND[from].rate / RATES_TO_VND[to].rate, 4)}{" "}
        {to} · Tỷ giá tham khảo, cập nhật hàng ngày
      </p>
    </div>
  );
}
