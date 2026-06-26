"use client";

import { useState } from "react";
import type { GoldPriceItem } from "../types";
import { formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GoldComparePanel({ prices }: { prices: GoldPriceItem[] }) {
  const domestic = prices.filter((p) => p.currency === "VND");
  const [selected, setSelected] = useState<string[]>(
    domestic.slice(0, 3).map((p) => p.code)
  );

  function toggle(code: string) {
    setSelected((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : prev.length < 5
          ? [...prev, code]
          : prev
    );
  }

  const compared = domestic.filter((p) => selected.includes(p.code));
  const maxSell = Math.max(...compared.map((p) => p.sell), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>So sánh giá giữa thương hiệu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {domestic.map((p) => (
            <button
              key={p.code}
              onClick={() => toggle(p.code)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                selected.includes(p.code)
                  ? "border-amber-500 bg-amber-50 text-amber-800"
                  : "border-slate-200 text-slate-600 hover:border-amber-300"
              }`}
            >
              {p.nameVi}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {compared.map((p) => (
            <div key={p.code} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{p.nameVi}</span>
                <span className="text-emerald-700 font-semibold">
                  {formatNumber(p.sell)} đ
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                  style={{ width: `${(p.sell / maxSell) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {compared.length >= 2 && (
          <p className="text-sm text-slate-500">
            Chênh lệch cao nhất:{" "}
            <strong className="text-slate-800">
              {formatNumber(
                Math.max(...compared.map((p) => p.sell)) -
                  Math.min(...compared.map((p) => p.sell))
              )}{" "}
              đ/lượng
            </strong>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
