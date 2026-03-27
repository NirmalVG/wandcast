"use client"

import { useRef, useEffect, useState } from "react"
import { useHandTracking } from "@/hooks/useHandTracking"
import { useWandTrail } from "@/hooks/useWandTrail"
import { useSpellRecognition } from "@/hooks/useSpellRecognition"
import HandOverlay from "./HandOverlay"
import type { HandOverlayHandle } from "./HandOverlay"
import { CAMERA_CONFIG } from "@/lib/mediapipe/config"
import type { SpellMatch } from "@/types"
import { useSpellEffects } from "@/hooks/useSpellEffects"
import SpellEffectLayer from "@/components/effects/SpellEffectLayer"

export default function CameraView() {
  const [flash, setFlash] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HandOverlayHandle>(null)

  const trackingResult = useHandTracking(videoRef)
  const { addPoint, clearTrail, trailRef } = useWandTrail()
  const { recognizeSpell } = useSpellRecognition()

  const { activeEffect, triggerEffect, clearEffect } = useSpellEffects()

  // Only spell result needs React state — drives UI text
  const [lastSpell, setLastSpell] = useState<SpellMatch>({
    spell: null,
    confidence: 0,
    castAt: 0,
  })

  // Feed wand tip into trail
  useEffect(() => {
    if (trackingResult.isTracking && trackingResult.wandTip) {
      addPoint(trackingResult.wandTip)
    } else {
      clearTrail()
    }
  }, [trackingResult, addPoint, clearTrail])

  // ── RENDER LOOP — no setState, draw directly via ref ──────────────────
  useEffect(() => {
    // Snapshot tracking result in a ref so rAF always gets latest value
    const trackingRef = { current: trackingResult }
    trackingRef.current = trackingResult

    let animFrameId: number

    const loop = () => {
      // Draw directly — zero React re-renders
      overlayRef.current?.draw(trackingRef.current, trailRef.current ?? [])

      // Spell recognition
      const match = recognizeSpell(trailRef.current ?? [])
      if (match.spell) {
        setLastSpell(match)
        triggerEffect(match.spell)
        setFlash(true)
        setTimeout(() => setFlash(false), 150)
      }

      animFrameId = requestAnimationFrame(loop)
    }

    animFrameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameId)
  }, [trailRef, recognizeSpell]) // trackingResult intentionally excluded

  // Keep tracking snapshot fresh without restarting the loop
  const trackingSnapshotRef = useRef(trackingResult)
  useEffect(() => {
    trackingSnapshotRef.current = trackingResult
  }, [trackingResult])

  // Fix: pass snapshot ref into loop properly
  useEffect(() => {
    let animFrameId: number

    const loop = () => {
      overlayRef.current?.draw(
        trackingSnapshotRef.current,
        trailRef.current ?? [],
      )

      const match = recognizeSpell(trailRef.current ?? [])
      if (match.spell) setLastSpell(match)

      animFrameId = requestAnimationFrame(loop)
    }

    animFrameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameId)
  }, [trailRef, recognizeSpell])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      <HandOverlay
        ref={overlayRef}
        width={CAMERA_CONFIG.width}
        height={CAMERA_CONFIG.height}
      />

      <SpellEffectLayer
        activeEffect={activeEffect}
        wandTip={trackingResult.wandTip}
        canvasWidth={CAMERA_CONFIG.width}
        canvasHeight={CAMERA_CONFIG.height}
        onComplete={clearEffect}
      />

      {/* HUD — only re-renders on spell cast */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <div
          className={`px-2 py-1 rounded text-white text-xs font-mono ${
            trackingResult.isTracking ? "bg-green-500/80" : "bg-red-500/50"
          }`}
        >
          {trackingResult.isTracking ? "🪄 Wand Active" : "✋ No Hand"}
        </div>

        {trackingResult.wandTip && (
          <div className="bg-black/60 text-yellow-300 px-2 py-1 rounded text-xs font-mono">
            x: {trackingResult.wandTip.x.toFixed(3)} · y:{" "}
            {trackingResult.wandTip.y.toFixed(3)}
          </div>
        )}

        {lastSpell.spell && (
          <div className="bg-yellow-500/80 text-black px-3 py-2 rounded font-mono text-sm font-bold">
            ✨ {lastSpell.spell.toUpperCase()}! (
            {(lastSpell.confidence * 100).toFixed(0)}%)
          </div>
        )}

        {flash && (
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: "rgba(255, 220, 60, 0.25)",
              animation: "flashOut 0.15s ease-out both",
            }}
          />
        )}
      </div>
    </div>
  )
}
