import { z } from "zod"

/** Public JSON export for Diamond Dixie’s Bombastic 4K Wager Race leaderboard */
export const BOMBASTIC_LEADERBOARD_JSON_URL =
  "https://exportdata.xcdn.tech/bombastic-affiliate-leaderboard-export/3633/1960940194/304548477.json" as const

/** Prize amounts: 1st $1.5k … 5th $300 (total $4,000) */
export const WAGER_RACE_PRIZES_USD = [1500, 1000, 700, 500, 300] as const

const playerSchema = z.object({
  playerId: z.number(),
  username: z.string(),
  bets: z.number(),
  deposits: z.number(),
  cashouts: z.number(),
})

export type LeaderboardPlayer = z.infer<typeof playerSchema>

export async function fetchLeaderboardPlayers(): Promise<LeaderboardPlayer[]> {
  const res = await fetch(BOMBASTIC_LEADERBOARD_JSON_URL, {
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    throw new Error(`Leaderboard HTTP ${res.status}`)
  }
  const json: unknown = await res.json()
  return z.array(playerSchema).parse(json)
}
