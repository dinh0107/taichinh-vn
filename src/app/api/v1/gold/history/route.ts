import { NextRequest, NextResponse } from "next/server";
import { getGoldHistory } from "@/modules/gold/service";
import type { HistoryRange } from "@/modules/gold/types";
import { z } from "zod";

const QuerySchema = z.object({
  code: z.string().default("SJL1L10"),
  range: z.enum(["1d", "7d", "30d", "90d", "1y", "all"]).default("30d"),
});

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = QuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { code, range } = parsed.data;

  try {
    const history = await getGoldHistory(code, range as HistoryRange);
    return NextResponse.json({
      success: true,
      code,
      range,
      count: history.length,
      data: history.map((h) => ({
        buy: h.buy,
        sell: h.sell,
        recordedAt: h.recordedAt.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
