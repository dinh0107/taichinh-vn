import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FILES = {
  icon: "logo-icon.png",
  logo: "brand-wordmark.png",
} as const;

type Kind = keyof typeof FILES;

async function readBrandFile(filename: string): Promise<Buffer | null> {
  const roots = [
    path.join(process.cwd(), "public", filename),
    path.join(process.cwd(), filename),
  ];
  for (const file of roots) {
    try {
      return await readFile(file);
    } catch {
      // try next
    }
  }
  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string }> }
) {
  const { kind: raw } = await context.params;
  if (!(raw in FILES)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const kind = raw as Kind;
  const buf = await readBrandFile(FILES[kind]);
  if (!buf) {
    return NextResponse.json({ error: "Asset missing" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, must-revalidate",
      "CDN-Cache-Control": "no-store",
    },
  });
}
