"use client"

import { useRef, useEffect, useState } from "react"
import { Mic, MicOff } from "lucide-react"
import { useHandTracking } from "@/hooks/useHandTracking"
import { useWandTrail } from "@/hooks/useWandTrail"
import { useSpellRecognition } from "@/hooks/useSpellRecognition"
import { useSpellEffects } from "@/hooks/useSpellEffects"
import { useIncantation } from "@/hooks/useIncantation"
import HandOverlay from "./HandOverlay"
import type { HandOverlayHandle } from "./HandOverlay"
import SpellEffectLayer from "@/components/effects/SpellEffectLayer"
import { CAMERA_CONFIG } from "@/lib/mediapipe/config"
import type { SpellMatch } from "@/types"

export default function CameraView() {
  const [flash, setFlash] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HandOverlayHandle>(null)

  // ─── HOOKS ────────────────────────────────────────────────────────
  const trackingResult = useHandTracking(videoRef)
  const { addPoint, clearTrail, trailRef } = useWandTrail()
  const { recognizeSpell } = useSpellRecognition()
  const { activeEffect, triggerEffect, clearEffect } = useSpellEffects()
  const { isListening, transcript, detectedSpell, error, toggleListening } =
    useIncantation()

  const [lastSpell, setLastSpell] = useState<SpellMatch>({
    spell: null,
    confidence: 0,
    castAt: 0,
  })

  // ─── TRAIL MANAGEMENT ─────────────────────────────────────────────
  useEffect(() => {
    if (trackingResult.isTracking && trackingResult.wandTip) {
      addPoint(trackingResult.wandTip)
    } else {
      clearTrail()
    }
  }, [trackingResult, addPoint, clearTrail])

  // ─── RENDER LOOP SNAPSHOTS ────────────────────────────────────────
  // We use refs so the requestAnimationFrame loop always sees the freshest data
  // without needing to be re-initialized.
  const trackingSnapshotRef = useRef(trackingResult)
  const voiceSpellRef = useRef(detectedSpell)

  useEffect(() => {
    trackingSnapshotRef.current = trackingResult
    voiceSpellRef.current = detectedSpell
  }, [trackingResult, detectedSpell])

  // ─── THE MASTER LOOP ──────────────────────────────────────────────
  useEffect(() => {
    let animFrameId: number

    const loop = () => {
      // 1. Draw the visual trail overlay
      overlayRef.current?.draw(
        trackingSnapshotRef.current,
        trailRef.current ?? [],
      )

      // 2. Calculate gesture match
      const match = recognizeSpell(trailRef.current ?? [])

      // 3. THE FORGIVENESS MULTIPLIER 🪄
      // If the physical gesture was sloppy (> 40%) but the microphone
      // explicitly heard the correct spell, boost confidence to 100%.
      if (
        match.spell &&
        match.confidence > 0.4 &&
        match.spell === voiceSpellRef.current
      ) {
        match.confidence = 1.0
      }

      // 4. Fire the spell
      if (match.spell && match.confidence >= 0.7) {
        setLastSpell({ ...match }) // Clone to force re-render of HUD
        triggerEffect(match.spell)

        // Trigger full-screen flash
        setFlash(true)
        setTimeout(() => setFlash(false), 150)
      }

      animFrameId = requestAnimationFrame(loop)
    }

    animFrameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameId)
  }, [trailRef, recognizeSpell, triggerEffect])

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* ── CAMERA FEED ── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        webkit-playsinline="true"
        muted
        // Added -scale-x-100 here to mirror the video
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
      />

      {/* ── 2D CANVAS (Hand Skeleton & Trail) ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100">
        <HandOverlay
          ref={overlayRef}
          width={CAMERA_CONFIG.width}
          height={CAMERA_CONFIG.height}
        />
      </div>

      {/* ── 3D CANVAS (Three.js Particles) ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100">
        <SpellEffectLayer
          activeEffect={activeEffect}
          wandTip={trackingResult.wandTip}
          canvasWidth={CAMERA_CONFIG.width}
          canvasHeight={CAMERA_CONFIG.height}
          onComplete={clearEffect}
        />
      </div>

      {/* ── HUD / UI LAYER ── */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-3">
        {/* Tracking Status */}
        <div
          className={`px-3 py-1.5 rounded-sm text-xs font-fira tracking-widest uppercase w-max transition-colors ${
            trackingResult.isTracking
              ? "bg-green-500/80 text-black"
              : "bg-red-500/50 text-white"
          }`}
        >
          {trackingResult.isTracking ? "🪄 Wand Active" : "✋ No Hand"}
        </div>

        {/* Voice Control Button */}
        <button
          onClick={toggleListening}
          className={`flex items-center w-max gap-2 px-3 py-2 rounded-sm text-xs font-fira tracking-widest uppercase transition-all border ${
            isListening
              ? "bg-gold-b text-black border-gold-b shadow-[0_0_15px_rgba(240,180,41,0.5)]"
              : "bg-black/60 text-gold-dim border-gold-dim hover:bg-black/80 hover:text-gold-pale"
          }`}
        >
          {isListening ? <Mic size={14} /> : <MicOff size={14} />}
          {isListening ? "Listening..." : "Enable Voice"}
        </button>

        {/* Live Transcript / Error Messages */}
        {error && (
          <div className="text-red-400 text-xs font-fira bg-black/60 px-2 py-1 rounded w-max">
            {error}
          </div>
        )}
        {isListening && transcript && (
          <div className="bg-black/70 border border-border-dim text-gold-pale px-3 py-2 rounded-sm text-xs font-fira italic max-w-[250px] truncate shadow-lg">
            "{transcript}"
          </div>
        )}

        {/* Coordinates (Helpful for debugging) */}
        {trackingResult.wandTip && (
          <div className="bg-black/60 text-yellow-300/70 px-2 py-1 rounded text-[10px] font-mono w-max">
            x: {trackingResult.wandTip.x.toFixed(3)} · y:{" "}
            {trackingResult.wandTip.y.toFixed(3)}
          </div>
        )}

        {/* Spell Cast Alert */}
        {lastSpell.spell && (
          <div className="mt-2 bg-gold-b text-black px-4 py-3 rounded-sm font-cinzel text-lg font-bold shadow-[0_0_20px_rgba(240,180,41,0.6)] animate-pulse w-max">
            ✨ {lastSpell.spell.toUpperCase()}! (
            {(lastSpell.confidence * 100).toFixed(0)}%)
          </div>
        )}
      </div>

      {/* ── FULL SCREEN FLASH ── */}
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
  )
}
