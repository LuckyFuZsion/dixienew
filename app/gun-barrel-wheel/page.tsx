"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Rye } from "next/font/google"

import { Button } from "@/components/ui/button"

const rye = Rye({ weight: "400", subsets: ["latin"] })
const NAMES_STORAGE_KEY = "gun_barrel_wheel_names_v1"
const DEFAULT_NAMES = ["Sara", "Mike", "Jessica", "Chris", "Emma", "David"] as const
const MAX_WHEEL_NAME_LABELS = 8

export default function GunBarrelWheelPage() {
  const [names, setNames] = useState<string[]>([...DEFAULT_NAMES])
  const [input, setInput] = useState("")
  const [rotation, setRotation] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)
  const [winnerPick, setWinnerPick] = useState<{ name: string; index: number } | null>(null)
  const [showSmoke, setShowSmoke] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [showRemovePrompt, setShowRemovePrompt] = useState(false)
  const [showRemoveActions, setShowRemoveActions] = useState(false)
  const [shotSeed, setShotSeed] = useState(0)

  const gunshotRef = useRef<HTMLAudioElement | null>(null)
  const rotationRef = useRef(0)
  const namesRef = useRef(names)

  namesRef.current = names
  rotationRef.current = rotation

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NAMES_STORAGE_KEY)
      if (!raw) return
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        const cleaned = parsed.map((s) => s.trim()).filter(Boolean)
        setNames(cleaned)
      }
    } catch {
      // Ignore corrupted storage
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(names))
    } catch {
      // Storage can fail in some privacy modes; ignore.
    }
  }, [names])

  useEffect(() => {
    if (!showRemovePrompt || !winnerPick) {
      setShowRemoveActions(false)
      return
    }
    setShowRemoveActions(false)
    setShotSeed((s) => s + 1)
    const id = window.setTimeout(() => setShowRemoveActions(true), 1500)
    return () => window.clearTimeout(id)
  }, [showRemovePrompt, winnerPick])

  const boardShots = useMemo(() => {
    // Deterministic-ish impact positions from a seed; kept away from edges and text area.
    const r = (n: number) => {
      const x = Math.sin((shotSeed + 1) * 999 + n * 97.13) * 43758.5453
      return x - Math.floor(x)
    }
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
    const points = [
      { x: 70, y: 38 },
      { x: 34, y: 66 },
      { x: 76, y: 70 },
    ].map((p, i) => ({
      left: `${clamp(p.x + (r(i + 1) - 0.5) * 14, 18, 86)}%`,
      top: `${clamp(p.y + (r(i + 7) - 0.5) * 14, 22, 84)}%`,
      delay: i * 0.18,
    }))
    return points
  }, [shotSeed])

  const sliceAngle = useMemo(() => 360 / Math.max(1, names.length), [names.length])
  const showNamesOnWheel = names.length <= MAX_WHEEL_NAME_LABELS
  const markerRadius = useMemo(() => {
    if (names.length <= 8) return 120
    if (names.length <= 12) return 108
    if (names.length <= 16) return 96
    return 84
  }, [names.length])
  const wheelLabelClass = useMemo(() => {
    if (names.length <= 8) return "w-16 text-xs"
    if (names.length <= 12) return "w-16 text-[11px]"
    if (names.length <= 16) return "w-14 text-[10px]"
    return "w-12 text-[10px]"
  }, [names.length])

  const unlockAudio = useCallback(async () => {
    if (audioUnlocked) return
    const el = gunshotRef.current
    if (!el) return
    try {
      const prevVolume = el.volume
      el.volume = 0
      await el.play()
      el.pause()
      el.currentTime = 0
      el.volume = prevVolume
      setAudioUnlocked(true)
    } catch {
      // If the browser still blocks playback, we'll just skip the sound.
    }
  }, [audioUnlocked])

  const addName = useCallback(() => {
    const v = input.trim()
    if (!v) return
    setNames((prev) => [...prev, v])
    setInput("")
  }, [input])

  const removeName = useCallback((index: number) => {
    setNames((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearAll = useCallback(() => {
    const ok = window.confirm("Are you sure you want to remove all players?")
    if (!ok) return
    setWinner(null)
    setShowSmoke(false)
    setRotation(0)
    setNames([])
    try {
      window.localStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify([]))
    } catch {
      // ignore
    }
  }, [])

  const calculateWinnerPick = useCallback(
    (finalRotation: number) => {
      const list = namesRef.current
      if (list.length === 0) return null
      const normalized = ((finalRotation % 360) + 360) % 360
      // Pointer is at 0deg (top). Convert pointer position into wheel-space, then pick
      // the closest slice center by offsetting half a slice before flooring.
      const pointerInWheelSpace = (360 - normalized) % 360
      const index = Math.floor((pointerInWheelSpace + sliceAngle / 2) / sliceAngle) % list.length
      const name = list[index]
      if (!name) return null
      return { name, index }
    },
    [sliceAngle]
  )

  const spinWheel = useCallback(() => {
    if (namesRef.current.length === 0) return
    void unlockAudio()
    setWinner(null)
    setWinnerPick(null)
    setShowRemovePrompt(false)
    setShowRemoveActions(false)
    setShowSmoke(false)
    const spin = 360 * 5 + Math.floor(Math.random() * 360)
    setRotation((prev) => prev + spin)
  }, [unlockAudio])

  const handleFinish = useCallback(() => {
    const pick = calculateWinnerPick(rotationRef.current)
    setWinnerPick(pick)
    setWinner(pick?.name ?? null)

    if (audioUnlocked && gunshotRef.current) {
      gunshotRef.current.currentTime = 0
      gunshotRef.current.play().catch(() => {})
    }

    setShowSmoke(true)
    window.setTimeout(() => setShowSmoke(false), 1200)
    if (pick) setShowRemovePrompt(true)
  }, [audioUnlocked, calculateWinnerPick])

  const keepWinner = useCallback(() => {
    setShowRemovePrompt(false)
  }, [])

  const removeWinner = useCallback(() => {
    const pick = winnerPick
    if (!pick) {
      setShowRemovePrompt(false)
      return
    }
    setNames((prev) => {
      if (prev.length === 0) return prev
      if (prev[pick.index] === pick.name) return prev.filter((_, i) => i !== pick.index)
      const fallbackIndex = prev.indexOf(pick.name)
      if (fallbackIndex >= 0) return prev.filter((_, i) => i !== fallbackIndex)
      return prev
    })
    setShowRemovePrompt(false)
    setWinner(null)
    setWinnerPick(null)
  }, [winnerPick])

  return (
    <div
      className="relative flex min-h-screen flex-col items-center gap-4 overflow-hidden px-4 py-8 text-yellow-100 sm:px-6"
      onPointerDown={() => void unlockAudio()}
    >
      <audio
        ref={gunshotRef}
        src="https://actions.google.com/sounds/v1/impacts/gunshot.ogg"
        preload="auto"
      />

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1400&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <h1
        className={`z-10 text-center text-3xl font-extrabold tracking-widest text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-4xl md:text-5xl ${rye.className}`}
      >
        🤠 HOOT SHOT THE PLAYER
      </h1>

      <div className="relative z-10 h-72 w-72 sm:h-80 sm:w-80">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3.5, ease: "easeOut" }}
          onAnimationComplete={handleFinish}
          className="relative h-full w-full rounded-full border-[12px] border-yellow-800 bg-gradient-to-br from-gray-600 to-black shadow-[0_0_40px_rgba(0,0,0,0.9)]"
        >
          {names.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="absolute flex h-full w-full items-center justify-center"
              style={{ transform: `rotate(${i * sliceAngle}deg)` }}
            >
              <div
                className="flex flex-col items-center"
                style={{ transform: `translateY(-${markerRadius}px)` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-yellow-900 bg-gradient-to-br from-yellow-300 to-yellow-700 shadow-lg">
                  {showNamesOnWheel ? (
                    <div className="h-4 w-4 rounded-full bg-yellow-100" />
                  ) : (
                    <span className="text-xs font-black tabular-nums text-yellow-950">{i + 1}</span>
                  )}
                </div>
                <span
                  title={name}
                  className={`mt-3 inline-block truncate whitespace-nowrap rounded border border-yellow-700 bg-yellow-900/80 px-1 text-center font-bold text-yellow-200 rotate-90 origin-center ${wheelLabelClass}`}
                >
                  {name}
                </span>
              </div>
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-4 border-yellow-950 bg-gradient-to-br from-yellow-300 to-yellow-900 shadow-inner" />
          </div>
        </motion.div>

        <div className="absolute left-1/2 top-0 -translate-x-1/2 text-3xl text-red-600 drop-shadow">▼</div>

        <AnimatePresence>
          {showSmoke && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.9, scale: 1.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="h-40 w-40 rounded-full bg-gray-300/40 blur-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {winner && (
        <div className="z-10 rounded-lg border border-yellow-700 bg-black/70 px-6 py-3 text-2xl font-extrabold text-yellow-300 shadow-xl">
          ⭐ WANTED: {winner}
        </div>
      )}

      {showRemovePrompt && winnerPick && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={keepWinner}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="winner-title"
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-amber-200/20 bg-gradient-to-br from-amber-950/95 via-amber-900/90 to-amber-950/95 p-5 shadow-2xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
            >
              {/* Wooden board frame + grain */}
              <div
                className="pointer-events-none absolute inset-0 opacity-90"
                aria-hidden
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 7px)",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 ring-1 ring-black/60"
                aria-hidden
              />

              {/* Gunshot impacts */}
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <motion.div
                  key={shotSeed}
                  initial={{ x: 0, y: 0, rotate: 0 }}
                  animate={{
                    x: [0, -3, 2, -2, 1, 0],
                    y: [0, 2, -2, 1, -1, 0],
                    rotate: [0, -0.6, 0.5, -0.4, 0.2, 0],
                  }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="absolute inset-0"
                />

                {boardShots.map((s, i) => (
                  <motion.div
                    key={`${shotSeed}-${i}`}
                    className="absolute"
                    style={{ left: s.left, top: s.top }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: s.delay, duration: 0.18 }}
                  >
                    {/* Smoke puff */}
                    <motion.div
                      className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-slate-200/25 blur-2xl"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: [0, 0.8, 0], scale: [0.6, 1.3, 1.8] }}
                      transition={{ delay: s.delay, duration: 0.75, ease: "easeOut" }}
                    />
                    {/* Bullet hole */}
                    <motion.div
                      className="h-6 w-6 rounded-full bg-black/75"
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: s.delay, duration: 0.12 }}
                      style={{
                        boxShadow:
                          "0 0 0 2px rgba(0,0,0,0.45), 0 0 0 6px rgba(255,255,255,0.06), 0 10px 20px rgba(0,0,0,0.35)",
                      }}
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-black to-black/10" />
                      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-xs font-black uppercase tracking-widest text-amber-200/90">
                  Winner
                </p>
                <h2
                  id="winner-title"
                  className={`mt-1 text-3xl font-black text-amber-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] ${rye.className}`}
                >
                  {winnerPick.name}
                </h2>
                <p className="mt-2 text-sm font-semibold text-amber-50/90">
                  Congratulations — you&apos;re the winner!
                </p>
              </motion.div>

              <AnimatePresence>
                {showRemoveActions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.35 }}
                    className="mt-5 border-t border-amber-200/20 pt-4"
                  >
                    <p className="text-sm font-medium text-amber-50/90">
                      Keep them in the wheel or remove them from the list?
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Button onClick={keepWinner} className="w-full sm:w-auto sm:flex-1">
                        Keep player
                      </Button>
                      <Button onClick={removeWinner} className="w-full sm:w-auto sm:flex-1">
                        Remove player
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="z-10 flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter outlaw name"
          className="w-full rounded border border-yellow-700 bg-black/70 p-2 text-yellow-200 placeholder-yellow-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") addName()
          }}
        />
        <div className="flex gap-2 sm:shrink-0">
          <Button onClick={addName} className="flex-1 sm:flex-none">
            Add
          </Button>
          <Button onClick={clearAll} className="flex-1 sm:flex-none">
            Clear all
          </Button>
        </div>
      </div>

      <div className="z-10 mt-4 w-full max-w-md rounded border border-yellow-700 bg-black/60 p-3">
        <h2 className="mb-2 text-sm font-bold text-yellow-300">Outlaws</h2>
        <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
          {names.map((name, index) => (
            <div
              key={`${name}-${index}-row`}
              className="flex items-center justify-between rounded border border-yellow-800 bg-black/40 px-2 py-1"
            >
              <span className="min-w-0 flex-1 pr-2 text-xs [overflow-wrap:anywhere]">{name}</span>
              <button
                type="button"
                onClick={() => removeName(index)}
                className="text-xs text-red-400 hover:text-red-200"
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={spinWheel} className="z-10 mt-2 w-full max-w-md">
        Spin
      </Button>
    </div>
  )
}

