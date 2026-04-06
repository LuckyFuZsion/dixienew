import { NextResponse } from "next/server"
import { fetchLeaderboardPlayers } from "@/lib/bombastic-leaderboard"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const players = await fetchLeaderboardPlayers()
    return NextResponse.json(players, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 502 })
  }
}
