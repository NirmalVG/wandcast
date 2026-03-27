"use client"

import type { ActiveEffect } from "@/hooks/useSpellEffects"
import type { WandPoint } from "@/types"
import LumosEffect from "./LumosEffect"

interface Props {
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
  if (!activeEffect || !wandTip) return null

  // key={activeEffect.id} forces full remount on each new cast
  switch (activeEffect.spell) {
    case "lumos":
      return (
        <LumosEffect
          key={activeEffect.id}
          wandTip={wandTip}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onComplete={onComplete}
        />
      )

    // Other spells added in future lessons
    default:
      return null
  }
}
