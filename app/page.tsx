"use client"

import { Sparkles, Gamepad2, Twitch, Youtube, MessageCircle, Instagram, Twitter, Cloud } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useMemo } from "react"
import useSWR from "swr"
import Image from "next/image"

interface LeaderboardPlayer {
  playerId: number
  username: string
  bets: number
  deposits: number
  cashouts: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const prizes = [1500, 1000, 700, 500, 300]
const placeLabels = ["1st Place", "2nd Place", "3rd Place", "4th Place", "5th Place"]
const placeSubtitles = ["Top Wagerer", "Runner Up", "Bronze Tier", "Rising Star", "On The Board"]
const placeMedals = ["gold", "silver", "bronze", "blue", "purple"] as const

export default function GamerPage() {
  const { data: leaderboardData, isLoading } = useSWR<LeaderboardPlayer[]>(
    "https://exportdata.xcdn.tech/bombastic-affiliate-leaderboard-export/3633/1960940194/304548477.json",
    fetcher,
    { refreshInterval: 60000 }
  )

  const sortedPlayers = useMemo(() => {
    if (!leaderboardData) return []
    return [...leaderboardData].sort((a, b) => b.bets - a.bets).slice(0, 5)
  }, [leaderboardData])

  const floatingParticles = useMemo(
    () =>
      [...Array(40)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${15 + Math.random() * 10}s`,
        size: 12 + Math.random() * 20,
      })),
    [],
  )

  const hearts = useMemo(
    () =>
      [...Array(15)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 4}s`,
        duration: `${12 + Math.random() * 8}s`,
        size: 10 + Math.random() * 16,
      })),
    [],
  )

  const stars = useMemo(
    () =>
      [...Array(20)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 6}s`,
        duration: `${10 + Math.random() * 12}s`,
        size: 8 + Math.random() * 18,
      })),
    [],
  )

  const bubbles = useMemo(
    () =>
      [...Array(20)].map(() => ({
        left: `${Math.random() * 100}%`,
        size: 30 + Math.random() * 60,
        delay: `${Math.random() * 8}s`,
        duration: `${12 + Math.random() * 8}s`,
      })),
    [],
  )

  const twinkles = useMemo(
    () =>
      [...Array(30)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
      })),
    [],
  )

  const clouds = useMemo(
    () =>
      [...Array(8)].map(() => ({
        top: `${5 + Math.random() * 40}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${30 + Math.random() * 20}s`,
        size: 80 + Math.random() * 120,
        opacity: 0.3 + Math.random() * 0.3,
      })),
    [],
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-blue-100 to-pink-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Clouds */}
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

        {/* Floating Particles */}
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

        {/* Animated Gradient Orbs */}
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Gamepad2 className="text-pink-400" size={48} />
            <Sparkles className="text-blue-300 animate-spin-slow" size={32} />
          </div>
          <Image 
            src="/bombastic-logo.png" 
            alt="Bombastic Casino" 
            width={400}
            height={100}
            className="mx-auto mb-4 drop-shadow-lg"
          />
          <p className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
            {"4K Wager Race"}
          </p>
        
        </div>

        {/* Leaderboard Card */}
        <Card className="w-full max-w-2xl backdrop-blur-md bg-white/60 border-2 border-white/80 shadow-2xl rounded-3xl p-8 animate-slide-up">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-400">
                Prize Pool
              </h2>
              <p className="text-sm text-slate-600 mt-1">{"Race to the top and claim your prize!"}</p>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400" />
                </div>
              ) : sortedPlayers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>{"No players yet. Be the first to join!"}</p>
                </div>
              ) : (
                sortedPlayers.map((player, index) => {
                  const medal = placeMedals[index]
                  const gradientBg = {
                    gold: "from-yellow-100/80 to-pink-100/80 border-yellow-200/60",
                    silver: "from-slate-100/80 to-blue-100/80 border-slate-200/60",
                    bronze: "from-orange-100/80 to-pink-100/80 border-orange-200/60",
                    blue: "from-blue-100/80 to-pink-100/80 border-blue-200/60",
                    purple: "from-purple-100/80 to-pink-100/80 border-purple-200/60",
                  }[medal]
                  const medalGradient = {
                    gold: "from-yellow-300 to-yellow-500",
                    silver: "from-slate-400 to-slate-600",
                    bronze: "from-orange-300 to-orange-600",
                    blue: "from-blue-300 to-blue-600",
                    purple: "from-purple-300 to-purple-600",
                  }[medal]
                  const prizeGradient = {
                    gold: "from-yellow-500 to-pink-500",
                    silver: "from-slate-500 to-blue-500",
                    bronze: "from-orange-500 to-pink-500",
                    blue: "from-blue-500 to-pink-500",
                    purple: "from-purple-500 to-pink-500",
                  }[medal]
                  const medalEmoji = ["1", "2", "3", "4", "5"][index]

                  return (
                    <div
                      key={player.playerId}
                      className={`flex items-center justify-between p-4 bg-gradient-to-r ${gradientBg} rounded-2xl border-2 hover:shadow-lg transition-shadow`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${medalGradient} rounded-full flex items-center justify-center text-white font-bold text-lg`}
                        >
                          {medalEmoji}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{player.username}</p>
                          <p className="text-sm text-slate-600">
                            {"Wagered: $"}
                            {player.bets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{placeLabels[index]}</p>
                        <p
                          className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${prizeGradient}`}
                        >
                          {"$"}
                          {prizes[index].toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="mt-6 p-4 bg-pink-100/60 rounded-xl border-2 border-pink-200/60">
              <p className="text-center text-sm font-semibold text-slate-700">
                {"Total Prize Pool: "}<span className="text-pink-500">{"$4,000"}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <footer className="relative z-10 pb-8">
        <div className="flex justify-center gap-4">
          <a
            href="https://twitch.tv"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white/70 backdrop-blur-sm border-2 border-white/80 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:bg-pink-100"
          >
            <Twitch className="text-pink-500" size={24} />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white/70 backdrop-blur-sm border-2 border-white/80 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:bg-pink-100"
          >
            <Youtube className="text-pink-500" size={24} />
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white/70 backdrop-blur-sm border-2 border-white/80 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:bg-pink-100"
          >
            <MessageCircle className="text-pink-500" size={24} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white/70 backdrop-blur-sm border-2 border-white/80 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:bg-pink-100"
          >
            <Instagram className="text-pink-500" size={24} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white/70 backdrop-blur-sm border-2 border-white/80 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:bg-pink-100"
          >
            <Twitter className="text-pink-500" size={24} />
          </a>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">{"Made with love for gamers"}</p>
      </footer>
    </div>
  )
}
