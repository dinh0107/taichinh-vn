/**
 * Google Search Console API — tạm tắt mặc định.
 * Bật lại khi có service account: GSC_ENABLED=true trong .env
 */
export function isGscEnabled(): boolean {
  return process.env.GSC_ENABLED === "true";
}
