import { NextResponse } from "next/server";
import { getCurrentGoldPrices } from "@/modules/gold/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prices = await getCurrentGoldPrices();
    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      count: prices.length,
      data: prices,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
