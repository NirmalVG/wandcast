"use client"

import { useCallback, useRef } from "react"
import { normalizeTrajectory } from "@/lib/gesture/normalize"
import { dtwDistance, distanceToConfidence } from "@/lib/gesture/dtw"
import { SPELL_TEMPLATES } from "@/lib/spells/templates"
import { CAST_THRESHOLD, TRAIL_LENGTH } from "@/lib/mediapipe/config"
import type { TrailPoint } from "@/hooks/useWandTrail"
import type { SpellMatch, SpellName } from "@/types"

export function useSpellRecognition() {
  // Cooldown — prevent the same spell firing 30x in one second
  const lastCastRef = useRef<number>(0)
  const COOLDOWN_MS = 1500

  const recognizeSpell = useCallback((trail: TrailPoint[]): SpellMatch => {
    // Need a full trail to recognize anything
    if (!trail || trail.length < TRAIL_LENGTH * 0.8) {
      return { spell: null, confidence: 0, castAt: 0 }
    }

    // Cooldown check
    const now = Date.now()
    if (now - lastCastRef.current < COOLDOWN_MS) {
      return { spell: null, confidence: 0, castAt: 0 }
    }

    // Normalize the user's trail
    const normalized = normalizeTrajectory(trail)
    if (normalized.length < 2) {
      return { spell: null, confidence: 0, castAt: 0 }
    }

    // Compare against every spell template
    let bestSpell: SpellName | null = null
    let bestConfidence = 0

    for (const [spellName, template] of Object.entries(SPELL_TEMPLATES)) {
      const distance = dtwDistance(normalized, template)
      const confidence = distanceToConfidence(distance)

      if (confidence > bestConfidence) {
        bestConfidence = confidence
        bestSpell = spellName as SpellName
      }
    }

    // Only cast if confidence is above threshold
    if (bestConfidence >= CAST_THRESHOLD && bestSpell) {
      lastCastRef.current = now
      return {
        spell: bestSpell,
        confidence: bestConfidence,
        castAt: now,
      }
    }

    return { spell: null, confidence: 0, castAt: 0 }
  }, [])

  return { recognizeSpell }
}
