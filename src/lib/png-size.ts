/** Read width/height from a PNG buffer (IHDR). No deps. */
export function readPngSize(
  buf: Buffer | Uint8Array
): { width: number; height: number } | null {
  if (buf.length < 24) return null;
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  if (b[0] !== 0x89 || b.toString("ascii", 1, 4) !== "PNG") return null;
  if (b.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}
