"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, MicOff } from "lucide-react"
import SpellEffectLayer from "@/components/effects/SpellEffectLayer"
import { useHandTracking } from "@/hooks/useHandTracking"
import { useIncantation } from "@/hooks/useIncantation"
import { useSpellEffects } from "@/hooks/useSpellEffects"
import { useSpellRecognition } from "@/hooks/useSpellRecognition"
import { useWandTrail } from "@/hooks/useWandTrail"
import { CAMERA_CONFIG } from "@/lib/mediapipe/config"
import type { SpellMatch, SpellName, WandPoint } from "@/types"
import HandOverlay from "./HandOverlay"
import type { HandOverlayHandle } from "./HandOverlay"

const FLASH_DURATION_MS = 240
const SPELL_BADGE_DURATION_MS = 1800

export default function CameraView() {
  const [flash, setFlash] = useState(false)
  const [viewportSize, setViewportSize] = useState<{
    width: number
    height: number
  }>({
    width: CAMERA_CONFIG.width,
    height: CAMERA_CONFIG.height,
  })
  const [lastSpell, setLastSpell] = useState<SpellMatch>({
    spell: null,
    confidence: 0,
    castAt: 0,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HandOverlayHandle>(null)

  const trackingResult = useHandTracking(videoRef)
  const { addPoint, clearTrail, trailRef } = useWandTrail()
  const { recognizeSpell } = useSpellRecognition()
  const { activeEffect, triggerEffect, clearEffect } = useSpellEffects()
  const { isListening, transcript, detectedSpell, error, toggleListening } =
    useIncantation()

  const trackingSnapshotRef = useRef(trackingResult)
  const voiceSpellRef = useRef(detectedSpell)
  const lastCastTimeRef = useRef(0)
  const lastVoiceCastRef = useRef<SpellName | null>(null)

  const castSpell = useCallback(
    (spell: SpellName, confidence: number, tip?: WandPoint | null) => {
      const now = Date.now()
      const currentTip = tip ??
        trackingSnapshotRef.current.wandTip ?? {
          x: 0.5,
          y: 0.5,
          z: 0,
        }

      lastCastTimeRef.current = now
      setLastSpell({
        spell,
        confidence,
        castAt: now,
      })
      triggerEffect(spell, currentTip)
      setFlash(true)
      window.setTimeout(() => setFlash(false), FLASH_DURATION_MS)
    },
    [triggerEffect],
  )

  useEffect(() => {
    if (trackingResult.isTracking && trackingResult.wandTip) {
      addPoint(trackingResult.wandTip)
      return
    }

    clearTrail()
  }, [addPoint, clearTrail, trackingResult])

  useEffect(() => {
    trackingSnapshotRef.current = trackingResult
    voiceSpellRef.current = detectedSpell
  }, [detectedSpell, trackingResult])

  useEffect(() => {
    if (!lastSpell.spell) return

    const timer = window.setTimeout(() => {
      setLastSpell({
        spell: null,
        confidence: 0,
        castAt: 0,
      })
    }, SPELL_BADGE_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [lastSpell])

  useEffect(() => {
    if (!detectedSpell) {
      lastVoiceCastRef.current = null
      return
    }

    if (!detectedSpell || detectedSpell === lastVoiceCastRef.current) return

    lastVoiceCastRef.current = detectedSpell
    const castFrame = window.requestAnimationFrame(() => {
      castSpell(detectedSpell, 1, trackingResult.wandTip)
    })

    return () => {
      window.cancelAnimationFrame(castFrame)
    }
  }, [castSpell, detectedSpell, trackingResult.wandTip])

  useEffect(() => {
    const updateViewport = () => {
      // Use window dimensions directly to avoid browser scaling issues
      const width = Math.max(
        window.innerWidth,
        document.documentElement.clientWidth
      )
      const height = Math.max(
        window.innerHeight,
        document.documentElement.clientHeight
      )

      if (width > 0 && height > 0) {
        setViewportSize({
          width: Math.round(width),
          height: Math.round(height),
        })
      }
    }

    updateViewport()

    window.addEventListener("orientationchange", updateViewport)
    window.addEventListener("resize", updateViewport)
    document.addEventListener("fullscreenchange", updateViewport)

    return () => {
      window.removeEventListener("orientationchange", updateViewport)
      window.removeEventListener("resize", updateViewport)
      document.removeEventListener("fullscreenchange", updateViewport)
    }
  }, [])

  useEffect(() => {
    let frameId = 0

    const loop = () => {
      overlayRef.current?.draw(
        trackingSnapshotRef.current,
        trailRef.current ?? [],
      )

      const match = recognizeSpell(trailRef.current ?? [])

      if (
        match.spell &&
        match.confidence > 0.4 &&
        match.spell === voiceSpellRef.current
      ) {
        match.confidence = 1
      }

      const now = Date.now()
      const timeSinceLastCast = now - lastCastTimeRef.current

      if (match.spell && match.confidence >= 0.7 && timeSinceLastCast > 1000) {
        clearTrail()
        castSpell(
          match.spell,
          match.confidence,
          trackingSnapshotRef.current.wandTip,
        )
      }

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [castSpell, clearTrail, recognizeSpell, trailRef])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover -scale-x-100"
      />

      {!trackingResult.isReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg-dark/95 backdrop-blur-sm transition-opacity duration-500">
          <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-gold-dim border-t-gold-b" />
            <div className="direction-reverse absolute inset-2 animate-spin rounded-full border border-gold-dim/50 border-b-gold-pale" />
            <span className="font-cinzel text-xl text-gold-b">W</span>
          </div>
          <h2 className="mb-2 font-cinzel text-lg tracking-widest text-ink">
            Aligning Arcane Focus
          </h2>
          <p className="animate-pulse font-fira text-xs tracking-widest text-ink-dim">
            CALIBRATING NEURAL MODEL...
          </p>
        </div>
      )}

      <div className="absolute inset-0 h-full w-full -scale-x-100 pointer-events-none">
        <HandOverlay
          ref={overlayRef}
          width={viewportSize.width}
          height={viewportSize.height}
        />
      </div>

      <div className="absolute inset-0 h-full w-full -scale-x-100 pointer-events-none">
        <SpellEffectLayer
          activeEffect={activeEffect}
          canvasWidth={viewportSize.width}
          canvasHeight={viewportSize.height}
          onComplete={clearEffect}
        />
      </div>

      <div className="pointer-events-none absolute left-6 top-12 z-30 flex flex-col gap-3">
        <div
          className={`w-max rounded-sm px-3 py-1.5 font-fira text-xs uppercase tracking-widest shadow-lg transition-colors ${
            trackingResult.isTracking
              ? "bg-green-500/80 text-black"
              : "bg-red-500/80 text-white"
          }`}
        >
          {trackingResult.isTracking ? "Wand Active" : "No Hand"}
        </div>

        {trackingResult.wandTip && (
          <div className="flex flex-col gap-1 rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-yellow-300/70 backdrop-blur-sm">
            <div>
              x: {trackingResult.wandTip.x.toFixed(3)} · y:{" "}
              {trackingResult.wandTip.y.toFixed(3)}
            </div>
            {trackingResult.allLandmarks.length >= 21 && (
              <div>
                hand width:{" "}
                {(
                  Math.hypot(
                    (trackingResult.allLandmarks[20]?.x ?? 0) -
                      (trackingResult.allLandmarks[0]?.x ?? 0),
                    (trackingResult.allLandmarks[20]?.y ?? 0) -
                      (trackingResult.allLandmarks[0]?.y ?? 0),
                  ) * 100
                ).toFixed(1)}
                %
              </div>
            )}
          </div>
        )}

        {lastSpell.spell && (
          <div className="mt-2 w-max animate-pulse rounded-sm bg-gold-b px-4 py-3 font-cinzel text-lg font-bold text-black shadow-[0_0_20px_rgba(240,180,41,0.6)]">
            {lastSpell.spell.toUpperCase()} (
            {(lastSpell.confidence * 100).toFixed(0)}%)
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-12 z-30 flex flex-col items-center gap-3 px-4">
        {error && (
          <div className="rounded-md bg-black/80 px-4 py-2 text-center font-fira text-xs text-red-400 shadow-lg backdrop-blur-md">
            {error}
          </div>
        )}

        {isListening && transcript && (
          <div className="max-w-[80%] truncate rounded-md border border-border-dim bg-black/80 px-4 py-2 text-center font-fira text-sm italic text-gold-pale shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md">
            &quot;{transcript}&quot;
          </div>
        )}

        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 rounded-full border px-6 py-3 font-fira text-xs uppercase tracking-widest shadow-xl transition-all ${
            isListening
              ? "scale-105 border-gold-b bg-gold-b text-black shadow-[0_0_20px_rgba(240,180,41,0.5)]"
              : "border-gold-dim bg-black/70 text-gold-dim backdrop-blur-md hover:bg-black/90 hover:text-gold-pale"
          }`}
        >
          {isListening ? <Mic size={16} /> : <MicOff size={16} />}
          {isListening ? "Listening..." : "Enable Voice"}
        </button>
      </div>

      {flash && (
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: "rgba(255, 220, 60, 0.25)",
            animation: "flashOut 0.24s ease-out both",
          }}
        />
      )}
    </div>
  )
}
