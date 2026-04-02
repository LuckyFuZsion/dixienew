/**
 * Deterministic avatar per player (DiceBear), stable for SSR/hydration.
 * Uses `bottts` — robot characters (neutral, varied but not human gendered).
 */
export function getPlayerAvatarUrl(playerId: number): string {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(String(playerId))}`
}
