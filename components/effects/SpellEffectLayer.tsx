"use client"

import { useEffect, useState } from "react"
import LumosEffect from "./LumosEffect"
import NoxEffect from "./NoxEffect"
// 🪄 1. Import the global ActiveEffect type that allows all spells
import type { WandPoint, ActiveEffect } from "@/types"

interface Props {
  // 🪄 2. Use the global type here! (This is what fixes the ts(2367) error)
  activeEffect: ActiveEffect | null
  wandTip: WandPoint | null
  canvasWidth: number
  canvasHeight: number
  onComplete: () => void
}

export default function SpellEffectLayer({
  activeEffect,
  wandTip,
  canvasWidth,
  canvasHeight,
  onComplete,
}: Props) {
  const [mounted, setMounted] = useState(false)

  // Fix Hydration Mismatch: Only render on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !activeEffect || !activeEffect.wandTip) return null

  return (
    // Force this to the absolute front with a high Z-Index
    <div className="fixed inset-0 z-[999] pointer-events-none">
      {activeEffect.spell === "lumos" && (
        <LumosEffect
          key={activeEffect.id}
          wandTip={activeEffect.wandTip}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onComplete={onComplete}
        />
      )}

      {/* 🪄 TypeScript now knows "nox" is a valid option! */}
      {activeEffect.spell === "nox" && (
        <NoxEffect
          key={activeEffect.id}
          wandTip={activeEffect.wandTip}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onComplete={onComplete}
        />
      )}
    </div>
  )
}
