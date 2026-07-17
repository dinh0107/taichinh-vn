import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FILES = {
  icon: "logo-icon.png",
  logo: "brand-wordmark.png",
} as const;

type Kind = keyof typeof FILES;

const CACHE = "public, max-age=86400, must-revalidate";

async function resolveBrandFile(
  filename: string
): Promise<{ buf: Buffer; mtimeMs: number } | null> {
  const roots = [
    path.join(process.cwd(), "public", filename),
    path.join(process.cwd(), filename),
  ];
  for (const file of roots) {
    try {
      const [buf, meta] = await Promise.all([readFile(file), stat(file)]);
      if (buf.length) return { buf, mtimeMs: meta.mtimeMs };
    } catch {
      // try next
    }
  }
  return null;
}

function pngHeaders(length: number, mtimeMs: number) {
  return {
    "Content-Type": "image/png",
    "Content-Length": String(length),
    "Cache-Control": CACHE,
    ETag: `"brand-${length}-${Math.trunc(mtimeMs)}"`,
  };
}

export async function HEAD(
  _request: Request,
  context: { params: Promise<{ kind: string }> }
) {
  const { kind: raw } = await context.params;
  if (!(raw in FILES)) {
    return new NextResponse(null, { status: 404 });
  }
  const file = await resolveBrandFile(FILES[raw as Kind]);
  if (!file) return new NextResponse(null, { status: 404 });
  return new NextResponse(null, {
    status: 200,
    headers: pngHeaders(file.buf.length, file.mtimeMs),
  });
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
  const file = await resolveBrandFile(FILES[kind]);
  if (!file) {
    return NextResponse.json({ error: "Asset missing" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buf), {
    status: 200,
    headers: pngHeaders(file.buf.length, file.mtimeMs),
  });
}
