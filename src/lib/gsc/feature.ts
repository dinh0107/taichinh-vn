/**
 * Google Search Console API integration.
 * Enabled by default. Set GSC_ENABLED=false to hide Sync GSC UI.
 * Credentials: Admin → Cài đặt, or GSC_* env vars.
 */
export function isGscEnabled(): boolean {
  return process.env.GSC_ENABLED !== "false";
}
