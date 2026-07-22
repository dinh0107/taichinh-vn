import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { NewsCategoryCode } from "@prisma/client";
import { getCurrentUser, isAdminRole } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { writeDailyAiArticle } from "@/modules/ai/daily-article";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Admin: generate one AI article (no day/category cap). */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let category: NewsCategoryCode | undefined;
  try {
    const body = (await request.json()) as { category?: string };
    if (
      body.category &&
      Object.values(NewsCategoryCode).includes(body.category as NewsCategoryCode)
    ) {
      category = body.category as NewsCategoryCode;
    }
  } catch {
    // empty body ok
  }

  try {
    // force: skip autoWrite flag + hour gate so Admin always can generate.
    const result = await writeDailyAiArticle({ force: true, category });

    if (result.skipped) {
      return NextResponse.json(
        { success: false, error: result.reason || "Bỏ qua", ...result },
        { status: 400 }
      );
    }

    if (result.created && result.slug) {
      revalidatePath("/admin/bai-viet");
      revalidatePath("/tin-tuc");
      revalidatePath(`/tin-tuc/${result.slug}`);
      revalidatePath("/feed.xml");
      revalidatePath("/feed/news.xml");
      if (result.status === "PUBLISHED") {
        revalidatePath("/");
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
      editUrl: result.articleId
        ? `/admin/bai-viet/${result.articleId}`
        : undefined,
    });
  } catch (error) {
    logger.error({ error }, "Admin AI article failed");
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Sinh bài AI thất bại",
      },
      { status: 500 }
    );
  }
}
