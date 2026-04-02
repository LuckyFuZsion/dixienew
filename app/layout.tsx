import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

/** OG image in /public */
const ogImagePath = "/Opengraph.png"

const leaderboardName = "$4K Wager Race"
const casinoName = "Bombastic Casino"
const affiliateName = "Diamond Dixie"
const prizeTotal = "$4,000"

const pageTitle = `${affiliateName} · ${leaderboardName} | ${casinoName}`
const pageDescription = `${leaderboardName} leaderboard for ${affiliateName} at ${casinoName}. Total prize pool ${prizeTotal} — top prizes $1,500, $1,000, $700, $500, and $300.`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: pageTitle,
  description: pageDescription,
  generator: "v0.app",
  applicationName: casinoName,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: casinoName,
    title: pageTitle,
    description: pageDescription,
    images: [
      {
        url: ogImagePath,
        alt: `${leaderboardName} — ${affiliateName} at ${casinoName}, ${prizeTotal} prize pool`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImagePath],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
