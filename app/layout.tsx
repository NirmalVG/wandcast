import type { Metadata } from "next"
import { Cinzel, Crimson_Text, Fira_Code } from "next/font/google"
import "./globals.css"
import CustomCursor from "@/components/ui/CustomCursor"
import ParticleBackground from "@/components/ui/ParticleBackground"

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" })
const crimson = Crimson_Text({
  weight: ["400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-crimson",
})
const fira = Fira_Code({ subsets: ["latin"], variable: "--font-fira" })

export const metadata: Metadata = {
  title: "WandCast | Master Wandless Magic",
  description:
    "Harness the ancient power of the arcane using only your hands in AR.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 🪄 Add suppressHydrationWarning to both tags
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased selection:bg-gold-b selection:text-bg-dark"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
