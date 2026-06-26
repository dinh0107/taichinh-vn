"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/utils";
import { Calculator } from "lucide-react";

const TERMS = [
  { label: "1 tháng", months: 1, rate: 4.75 },
  { label: "3 tháng", months: 3, rate: 4.9 },
  { label: "6 tháng", months: 6, rate: 5.65 },
  { label: "12 tháng", months: 12, rate: 6.35 },
  { label: "24 tháng", months: 24, rate: 6.5 },
];

export function SavingsCalculator() {
  const [principal, setPrincipal] = useState("100000000");
  const [termIdx, setTermIdx] = useState(3);

  const amount = parseFloat(principal) || 0;
  const term = TERMS[termIdx];
  const interest = (amount * term.rate * term.months) / (100 * 12);
  const total = amount + interest;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-bold text-slate-900">
          Tính lãi tiền gửi tiết kiệm
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Số tiền gửi (VNĐ)
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold tabular-nums outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[50, 100, 200, 500].map((m) => (
                <button
                  key={m}
                  onClick={() => setPrincipal(String(m * 1_000_000))}
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-amber-100 hover:text-amber-700"
                >
                  {m} triệu
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Kỳ hạn
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TERMS.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setTermIdx(i)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    termIdx === i
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 rounded-xl bg-gradient-to-br from-amber-50 to-white p-5 ring-1 ring-amber-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Lãi suất</span>
            <span className="font-bold text-slate-700">{term.rate}%/năm</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Tiền lãi</span>
            <span className="font-bold text-emerald-700">
              +{formatNumber(interest)} đ
            </span>
          </div>
          <div className="border-t border-amber-200 pt-3">
            <span className="text-sm text-slate-500">Tổng nhận khi đáo hạn</span>
            <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-amber-700">
              {formatNumber(total)} đ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
