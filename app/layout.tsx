import type { Metadata, Viewport } from "next"
import CustomCursor from "@/components/ui/CustomCursor"
import "./globals.css"

export const metadata: Metadata = {
  title: "WandCast | Master Wandless Magic",
  description:
    "Harness the ancient power of the arcane using only your hands in AR.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-screen w-screen overflow-hidden"
    >
      <body
        className="h-screen w-screen overflow-hidden antialiased selection:bg-gold-b selection:text-bg-dark"
        suppressHydrationWarning
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
