/** GiaHomNay public widget APIs (same origin family as giahomnay.vn). */

export const GHN_API_BASE =
  process.env.GHN_API_BASE_URL?.replace(/\/$/, "") ?? "https://giahomnay.vn";

export async function ghnFetchJson<T>(path: string): Promise<T> {
  const url = `${GHN_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "TaiChinhVN/1.0 (+https://giahomnay.site)",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`GHN API ${path} → HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
