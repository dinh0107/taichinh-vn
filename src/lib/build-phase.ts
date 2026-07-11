/**
 * True while `next build` is collecting/prerendering pages.
 * Avoid hitting MySQL during build on shared hosting (bad credentials / slow DB).
 */
export function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
