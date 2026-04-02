/** Deterministic “random” avatar per player (DiceBear), stable for SSR/hydration. */
export function getPlayerAvatarUrl(playerId: number): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(String(playerId))}`
}
