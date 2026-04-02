"use client"

import { Sparkles, Cloud, Crown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import Image from "next/image"
import { WAGER_RACE_PRIZES_USD, type LeaderboardPlayer } from "@/lib/bombastic-leaderboard"
import { maskUsername } from "@/lib/utils"
import { getPlayerAvatarUrl } from "@/lib/player-avatar"

const BOMBASTIC_SIGNUP_URL = "https://bombastic.com/?ref=diamonddixie"

/** Wager race window (month index 3 = April, local time). */
const LEADERBOARD_PERIOD_YEAR = 2026
const LEADERBOARD_PERIOD_START = new Date(LEADERBOARD_PERIOD_YEAR, 3, 1, 0, 0, 1)
const LEADERBOARD_PERIOD_END = new Date(LEADERBOARD_PERIOD_YEAR, 3, 30, 23, 59, 59)

type CountdownPhase =
  | { phase: "before"; target: Date }
  | { phase: "during"; target: Date }
  | { phase: "after" }

function getCountdownPhase(now: Date): CountdownPhase {
  const t = now.getTime()
  if (t < LEADERBOARD_PERIOD_START.getTime()) return { phase: "before", target: LEADERBOARD_PERIOD_START }
  if (t <= LEADERBOARD_PERIOD_END.getTime()) return { phase: "during", target: LEADERBOARD_PERIOD_END }
  return { phase: "after" }
}

function splitDuration(ms: number): { d: number; h: number; m: number; s: number } {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  return {
    d: Math.floor(totalSec / 86400),
    h: Math.floor((totalSec % 86400) / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
  }
}

async function leaderboardFetcher(url: string): Promise<LeaderboardPlayer[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Leaderboard unavailable")
  return res.json()
}

/** Shown above the leaderboard. */
const WAGERING_RULE =
  "Note: No originals can be used at 1.01x for wagering."

const MIN_LEADERBOARD_ROWS = 10

const placeMedals = ["gold", "silver", "bronze", "blue", "purple"] as const

function ordinal(n: number): string {
  const j = n % 10
  const k = n % 100
  if (k >= 11 && k <= 13) return `${n}th`
  if (j === 1) return `${n}st`
  if (j === 2) return `${n}nd`
  if (j === 3) return `${n}rd`
  return `${n}th`
}

function placeLabel(rank: number): string {
  return `${ordinal(rank)} Place`
}

/** Deterministic 0..1 from an integer seed — same on server and client (avoids hydration mismatches). */
function rnd(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

function rndRange(seed: number, min: number, max: number): number {
  return min + rnd(seed) * (max - min)
}

export default function GamerPage() {
  /** Decorative layers use inline styles; render only after mount so SSR HTML matches the client (no hydration mismatch). */
  const [decorReady, setDecorReady] = useState(false)
  useEffect(() => {
    setDecorReady(true)
  }, [])

  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const {
    data: leaderboardData,
    isLoading,
    error: leaderboardError,
  } = useSWR<LeaderboardPlayer[]>("/api/leaderboard", leaderboardFetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  })

  /** Everyone who has wagered (>0), highest first */
  const sortedWageredPlayers = useMemo(() => {
    if (!leaderboardData) return []
    return [...leaderboardData].filter((p) => p.bets > 0).sort((a, b) => b.bets - a.bets)
  }, [leaderboardData])

  /** At least 10 rows; if more than 10 have wagered, show all of them */
  const leaderboardRows = useMemo(() => {
    const n = sortedWageredPlayers.length
    const count = Math.max(MIN_LEADERBOARD_ROWS, n)
    return Array.from({ length: count }, (_, i) => sortedWageredPlayers[i] ?? null)
  }, [sortedWageredPlayers])

  const floatingParticles = useMemo(
    () =>
      [...Array(40)].map((_, i) => ({
        left: `${rndRange(i * 6 + 1, 0, 100)}%`,
        top: `${rndRange(i * 6 + 2, 0, 100)}%`,
        delay: `${rndRange(i * 6 + 3, 0, 5)}s`,
        duration: `${15 + rndRange(i * 6 + 4, 0, 10)}s`,
        size: 12 + rndRange(i * 6 + 5, 0, 20),
      })),
    [],
  )

  const hearts = useMemo(
    () =>
      [...Array(15)].map((_, i) => ({
        left: `${rndRange(i * 7 + 101, 0, 100)}%`,
        top: `${rndRange(i * 7 + 102, 0, 100)}%`,
        delay: `${rndRange(i * 7 + 103, 0, 4)}s`,
        duration: `${12 + rndRange(i * 7 + 104, 0, 8)}s`,
        size: 10 + rndRange(i * 7 + 105, 0, 16),
      })),
    [],
  )

  const stars = useMemo(
    () =>
      [...Array(20)].map((_, i) => ({
        left: `${rndRange(i * 7 + 201, 0, 100)}%`,
        top: `${rndRange(i * 7 + 202, 0, 100)}%`,
        delay: `${rndRange(i * 7 + 203, 0, 6)}s`,
        duration: `${10 + rndRange(i * 7 + 204, 0, 12)}s`,
        size: 8 + rndRange(i * 7 + 205, 0, 18),
      })),
    [],
  )

  const bubbles = useMemo(
    () =>
      [...Array(20)].map((_, i) => ({
        left: `${rndRange(i * 5 + 301, 0, 100)}%`,
        size: 30 + rndRange(i * 5 + 302, 0, 60),
        delay: `${rndRange(i * 5 + 303, 0, 8)}s`,
        duration: `${12 + rndRange(i * 5 + 304, 0, 8)}s`,
      })),
    [],
  )

  const twinkles = useMemo(
    () =>
      [...Array(30)].map((_, i) => ({
        left: `${rndRange(i * 4 + 401, 0, 100)}%`,
        top: `${rndRange(i * 4 + 402, 0, 100)}%`,
        delay: `${rndRange(i * 4 + 403, 0, 3)}s`,
      })),
    [],
  )

  const clouds = useMemo(
    () =>
      [...Array(8)].map((_, i) => ({
        top: `${5 + rndRange(i * 8 + 501, 0, 40)}%`,
        delay: `${rndRange(i * 8 + 502, 0, 10)}s`,
        duration: `${30 + rndRange(i * 8 + 503, 0, 20)}s`,
        size: 80 + rndRange(i * 8 + 504, 0, 120),
        opacity: 0.3 + rndRange(i * 8 + 505, 0, 0.3),
      })),
    [],
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-blue-100 to-pink-50">
      {/* Animated background: random-positioned layers only after mount (avoids SSR/client style serialization mismatches). */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {decorReady && (
          <>
            {clouds.map((cloud, i) => (
              <div
                key={`cloud-${i}`}
                className="absolute animate-cloud"
                style={{
                  top: cloud.top,
                  left: "-200px",
                  animationDelay: cloud.delay,
                  animationDuration: cloud.duration,
                  opacity: cloud.opacity,
                }}
              >
                <Cloud
                  className="text-white drop-shadow-lg"
                  style={{ width: cloud.size, height: cloud.size }}
                  fill="white"
                  strokeWidth={0.5}
                />
              </div>
            ))}

            {floatingParticles.map((particle, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                }}
              >
                <Sparkles className="text-pink-400/50" size={particle.size} />
              </div>
            ))}

            {hearts.map((heart, i) => (
              <div
                key={`heart-${i}`}
                className="absolute animate-float"
                style={{
                  left: heart.left,
                  top: heart.top,
                  animationDelay: heart.delay,
                  animationDuration: heart.duration,
                }}
              >
                <div className="text-pink-500/40" style={{ width: heart.size, height: heart.size }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
            ))}

            {stars.map((star, i) => (
              <div
                key={`star-${i}`}
                className="absolute animate-float"
                style={{
                  left: star.left,
                  top: star.top,
                  animationDelay: star.delay,
                  animationDuration: star.duration,
                }}
              >
                <div className="text-pink-300/40" style={{ width: star.size, height: star.size }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
            ))}

            {bubbles.map((bubble, i) => (
              <div
                key={`bubble-${i}`}
                className="absolute rounded-full animate-bubble"
                style={{
                  left: bubble.left,
                  bottom: "-100px",
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  background:
                    i % 2 === 0
                      ? `radial-gradient(circle at 30% 30%, rgba(244, 114, 182, 0.4), rgba(244, 114, 182, 0.1))`
                      : `radial-gradient(circle at 30% 30%, rgba(147, 197, 253, 0.4), rgba(191, 219, 254, 0.2))`,
                  animationDelay: bubble.delay,
                  animationDuration: bubble.duration,
                }}
              />
            ))}

            {twinkles.map((dot, i) => (
              <div
                key={`dot-${i}`}
                className="absolute w-1 h-1 bg-pink-400 rounded-full animate-twinkle"
                style={{
                  left: dot.left,
                  top: dot.top,
                  animationDelay: dot.delay,
                }}
              />
            ))}
          </>
        )}

        {/* Static gradient orbs — identical on server and client */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-80 h-80 bg-pink-200/25 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-fuchsia-200/25 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "6s" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-3 py-10 sm:px-4 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="text-blue-300 animate-spin-slow" size={32} />
          </div>
          <a
            href={BOMBASTIC_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mb-4 block w-full max-w-[min(100%,28rem)] focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 rounded-lg"
          >
            <Image
              src="/bombastic-casino-logo.png"
              alt="Bombastic Casino — sign up"
              width={640}
              height={640}
              priority
              className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </a>
          <p className="text-lg md:text-xl font-medium text-slate-600">Diamond Dixie · Bombastic Casino</p>
          <p className="text-3xl md:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 tracking-tight mt-2 uppercase">
            $4K WAGER RACE
          </p>
        </div>

        {/* Leaderboard period & countdown */}
        <div className="w-full max-w-3xl mb-10 rounded-[2rem] border-2 border-white/70 bg-white/45 backdrop-blur-md px-5 py-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <h3 className="text-center text-xl md:text-2xl font-heading font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600">
            Leaderboard period
          </h3>
          <p className="mt-3 text-center text-sm md:text-base text-slate-700 font-medium leading-relaxed">
            <span className="block sm:inline">
              1 April {LEADERBOARD_PERIOD_YEAR}, 00:00:01
            </span>
            <span className="mx-1 text-slate-400">—</span>
            <span className="block sm:inline">
              30 April {LEADERBOARD_PERIOD_YEAR}, 23:59:59
            </span>
          </p>
          <p className="mt-1 text-center text-xs text-slate-500">All times use your device&apos;s local timezone.</p>

          <div className="mt-6">
            {!now ? (
              <p className="text-center text-sm text-slate-400">Loading countdown…</p>
            ) : (
              (() => {
                const phase = getCountdownPhase(now)
                if (phase.phase === "after") {
                  return (
                    <p className="text-center text-base font-bold text-slate-600">
                      This leaderboard period has ended.
                    </p>
                  )
                }
                const ms = phase.target.getTime() - now.getTime()
                const { d, h, m, s } = splitDuration(ms)
                const label = phase.phase === "before" ? "Starts in" : "Time remaining"
                const pad = (n: number) => String(n).padStart(2, "0")
                return (
                  <div>
                    <p className="text-center text-sm font-black uppercase tracking-widest text-slate-500 mb-3">
                      {label}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                      {[
                        { value: String(d), unit: "Days" },
                        { value: pad(h), unit: "Hours" },
                        { value: pad(m), unit: "Mins" },
                        { value: pad(s), unit: "Secs" },
                      ].map((cell) => (
                        <div
                          key={cell.unit}
                          className="rounded-2xl border-2 border-white/80 bg-gradient-to-b from-white/90 to-pink-50/80 px-3 py-4 text-center shadow-sm"
                        >
                          <div className="font-heading font-black text-3xl md:text-4xl tabular-nums text-slate-800">
                            {cell.value}
                          </div>
                          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {cell.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        </div>

        {/* Leaderboard Card */}
        <Card className="w-full max-w-3xl backdrop-blur-xl bg-white/40 border-2 border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[1.75rem] p-4 sm:rounded-[2.5rem] sm:p-8 md:p-10 animate-slide-up">
          <div className="space-y-5 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-3xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 tracking-tighter uppercase sm:text-4xl">
                PRIZE POOL
              </h2>
              <div
                className="mx-auto mt-4 max-w-xl rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-left shadow-sm sm:mt-5 sm:text-center"
                role="note"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800/90">Rule</p>
                <p className="mt-1 text-sm font-medium leading-snug text-amber-950 sm:text-base">
                  {WAGERING_RULE}
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {leaderboardError ? (
                <div className="text-center py-12 text-red-600 text-lg font-bold">
                  Could not load the leaderboard. Please refresh in a moment.
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
                </div>
              ) : (
                leaderboardRows.map((player, index) => {
                  const rank = index + 1
                  const medal = rank <= 5 ? placeMedals[rank - 1] : ("neutral" as const)
                  const gradientBg =
                    medal === "neutral"
                      ? "from-slate-50/75 to-slate-100/75 border-slate-200/45 shadow-slate-100/40"
                      : {
                          gold: "from-yellow-50/90 to-pink-50/90 border-yellow-200/50 shadow-yellow-100/50",
                          silver: "from-slate-50/90 to-blue-50/90 border-slate-200/50 shadow-slate-100/50",
                          bronze: "from-orange-50/90 to-pink-50/90 border-orange-200/50 shadow-orange-100/50",
                          blue: "from-blue-50/90 to-pink-50/90 border-blue-200/50 shadow-blue-100/50",
                          purple: "from-purple-50/90 to-pink-50/90 border-purple-200/50 shadow-purple-100/50",
                        }[medal]
                  const medalGradient =
                    medal === "neutral"
                      ? "from-slate-300 via-slate-400 to-slate-500"
                      : {
                          gold: "from-yellow-400 via-yellow-500 to-yellow-600",
                          silver: "from-slate-300 via-slate-400 to-slate-500",
                          bronze: "from-orange-300 via-orange-400 to-orange-500",
                          blue: "from-blue-400 via-blue-500 to-blue-600",
                          purple: "from-purple-400 via-purple-500 to-purple-600",
                        }[medal]
                  const prizeGradient =
                    medal === "neutral"
                      ? "from-slate-500 to-slate-600"
                      : {
                          gold: "from-yellow-600 to-pink-600",
                          silver: "from-slate-600 to-blue-600",
                          bronze: "from-orange-600 to-pink-600",
                          blue: "from-blue-600 to-pink-600",
                          purple: "from-purple-600 to-pink-600",
                        }[medal]
                  const prizeUsd = rank <= WAGER_RACE_PRIZES_USD.length ? WAGER_RACE_PRIZES_USD[rank - 1] : undefined
                  const rowKey = player ? `p-${player.playerId}` : `open-${rank}`

                  const crownClass =
                    rank === 1
                      ? "text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.65)]"
                      : rank === 2
                        ? "text-slate-300 drop-shadow-[0_2px_8px_rgba(148,163,184,0.55)]"
                        : "text-amber-800 drop-shadow-[0_2px_8px_rgba(146,64,14,0.45)]"

                  return (
                    <div
                      key={rowKey}
                      className={`relative ${rank <= 3 ? "mt-7 pt-1" : ""}`}
                    >
                      {rank <= 3 && (
                        <div
                          className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[60%]"
                          aria-hidden
                        >
                          <Crown
                            className={`h-10 w-10 sm:h-11 sm:w-11 ${crownClass}`}
                            strokeWidth={1.25}
                            fill="currentColor"
                          />
                        </div>
                      )}
                      <div
                        className={`group flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5 bg-gradient-to-r ${gradientBg} rounded-2xl border-2 transition-all duration-500 sm:rounded-3xl ${
                          player
                            ? "hover:shadow-2xl sm:hover:-translate-y-1 sm:hover:scale-[1.02]"
                            : "opacity-80 border-dashed"
                        }`}
                      >
                        {/* Rank + player info: mobile-first full width, no clipping */}
                        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center sm:gap-4">
                          <div
                            className={`shrink-0 w-12 h-12 min-w-[3rem] bg-gradient-to-br sm:w-14 sm:h-14 sm:min-w-[3.5rem] ${medalGradient} rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black shadow-lg text-lg sm:text-2xl ${
                              player ? "sm:group-hover:rotate-12 sm:transition-transform sm:duration-300" : ""
                            }`}
                          >
                            {rank}
                          </div>
                          {player ? (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/90 bg-white shadow-md ring-1 ring-slate-200/80 sm:h-14 sm:w-14">
                              <Image
                                src={getPlayerAvatarUrl(player.playerId)}
                                alt={`Avatar for ${maskUsername(player.username)}`}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div
                              className="h-12 w-12 shrink-0 rounded-full border-2 border-dashed border-slate-300/80 bg-slate-100/90 sm:h-14 sm:w-14"
                              aria-hidden
                            />
                          )}
                          <div className="min-w-0 flex-1 space-y-1">
                            <p
                              className={`font-heading font-black text-lg uppercase leading-snug tracking-tight [overflow-wrap:anywhere] sm:text-xl md:text-2xl ${
                                player
                                  ? "break-words text-slate-800 sm:truncate sm:group-hover:text-pink-600 sm:transition-colors"
                                  : "text-slate-400"
                              }`}
                            >
                              {player ? maskUsername(player.username) : "—"}
                            </p>
                            <p className="text-sm font-bold leading-relaxed text-slate-600 sm:text-base">
                              {player ? (
                                <>
                                  <span className="text-slate-500">Wagered: </span>
                                  <span className="break-words tabular-nums text-slate-800">
                                    {"$"}
                                    {player.bets.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-400">Open</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Place + prize: own row on mobile so nothing is squeezed */}
                        <div className="flex w-full min-w-0 flex-row items-center justify-between gap-3 border-t border-black/[0.06] pt-3 sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1 sm:border-t-0 sm:pt-0 sm:pl-2">
                          <p className="max-w-[45%] shrink-0 text-left text-xs font-black uppercase leading-snug tracking-wide text-slate-500 sm:max-w-none sm:text-right sm:text-sm sm:tracking-widest">
                            {placeLabel(rank)}
                          </p>
                          {prizeUsd != null ? (
                            <p
                              className={`min-w-0 text-right text-2xl font-black tabular-nums leading-none text-transparent bg-clip-text bg-gradient-to-r sm:text-3xl ${prizeGradient} animate-prize-pulse`}
                            >
                              {"$"}
                              {prizeUsd.toLocaleString("en-US")}
                            </p>
                          ) : (
                            <p className="text-xl font-black text-slate-400 sm:text-2xl">—</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="mt-6 rounded-2xl border-2 border-white/60 bg-gradient-to-r from-pink-500/10 to-blue-500/10 p-4 backdrop-blur-md sm:mt-8 sm:p-6">
              <p className="text-center text-lg font-heading font-black uppercase tracking-tighter text-slate-700 sm:text-2xl">
                {"TOTAL PRIZE POOL: "}
                <span className="text-pink-600 text-2xl sm:text-3xl">{"$4,000"}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <footer className="relative z-10 pb-10 px-4">
        <div className="flex flex-col items-center gap-3 max-w-md mx-auto text-center">
          <a
            href={BOMBASTIC_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-blue-500 px-8 py-4 text-lg font-heading font-black uppercase tracking-wide text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
          >
            Sign up at Bombastic
          </a>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-slate-300/50 pt-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Made by</p>
          <a
            href="https://webfuzsion.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-opacity hover:opacity-100 opacity-90"
          >
            <Image
              src="/WebFuZsion-Web-Design-Studio-Grantham-Logo.png"
              alt="WebFuZsion Web Design Studio, Grantham"
              width={560}
              height={160}
              className="h-24 w-auto max-w-[min(100%,560px)] object-contain object-center"
            />
          </a>
        </div>
      </footer>
    </div>
  )
}
