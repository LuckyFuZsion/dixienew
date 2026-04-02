import { NextResponse } from "next/server"
import { fetchLeaderboardPlayers } from "@/lib/bombastic-leaderboard"

export const revalidate = 60

export async function GET() {
  try {
    const players = await fetchLeaderboardPlayers()
    return NextResponse.json(players, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 502 })
  }
}
