"use client"

import CameraView from "@/components/camera/CameraView"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CameraPage() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden relative">
      <Link
        href="/"
        className="absolute top-4 right-4 z-50 bg-black/50 text-gold-b p-2 rounded-full border border-gold-dim hover:bg-black/80 transition-colors"
      >
        <ArrowLeft size={20} />
      </Link>

      <CameraView />
    </main>
  )
}
