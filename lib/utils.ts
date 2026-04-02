import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** First 2 + asterisks + last 2 for privacy (e.g. `AdorableMorel0392` → `Ad************92`). */
export function maskUsername(username: string): string {
  const s = username.trim()
  const n = s.length
  if (n === 0) return "—"
  if (n <= 2) return "**"
  if (n === 3) return `${s[0]}*${s[2]}`
  if (n === 4) return `${s.slice(0, 2)}**${s.slice(-2)}`
  return `${s.slice(0, 2)}${"*".repeat(n - 4)}${s.slice(-2)}`
}
