"use client"

import { useState, useCallback } from "react"
// 🪄 Make sure to import WandPoint so TypeScript knows what a coordinate is
import type { SpellName, WandPoint, ActiveEffect } from "@/types"

export function useSpellEffects() {
  const [activeEffect, setActiveEffect] = useState<ActiveEffect | null>(null)

  // 🪄 ADDED: Tell the function it requires a tip coordinate when called
  const triggerEffect = useCallback((spell: SpellName, tip: WandPoint) => {
    setActiveEffect({
      spell,
      id: Date.now(), // forces remount = fresh animation
      wandTip: tip, // 🪄 ADDED: Save the coordinate into the state
    })
  }, [])

  const clearEffect = useCallback(() => {
    setActiveEffect(null)
  }, [])

  return { activeEffect, triggerEffect, clearEffect }
}
