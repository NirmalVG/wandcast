"use client"

import { useState, useCallback } from "react"
import type { SpellName } from "@/types"

export interface ActiveEffect {
  spell: SpellName
  id: number // unique key so React remounts on each cast
}

export function useSpellEffects() {
  const [activeEffect, setActiveEffect] = useState<ActiveEffect | null>(null)

  const triggerEffect = useCallback((spell: SpellName) => {
    setActiveEffect({
      spell,
      id: Date.now(), // forces remount = fresh animation
    })
  }, [])

  const clearEffect = useCallback(() => {
    setActiveEffect(null)
  }, [])

  return { activeEffect, triggerEffect, clearEffect }
}
