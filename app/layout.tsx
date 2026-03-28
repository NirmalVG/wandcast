import type { Metadata } from "next"
import CustomCursor from "@/components/ui/CustomCursor"
import "./globals.css"

export const metadata: Metadata = {
  title: "WandCast | Master Wandless Magic",
  description:
    "Harness the ancient power of the arcane using only your hands in AR.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased selection:bg-gold-b selection:text-bg-dark"
        suppressHydrationWarning
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
