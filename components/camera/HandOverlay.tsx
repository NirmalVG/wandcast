"use client"

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import type { HandTrackingResult } from "@/types"
import type { TrailPoint } from "@/hooks/useWandTrail"

// ── Exported handle type — import this in CameraView ─────────────────────────
export type HandOverlayHandle = {
  draw: (trackingResult: HandTrackingResult, trail: TrailPoint[]) => void
}

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  width: number
  height: number
}

// ── Constants ─────────────────────────────────────────────────────────────────
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
]

// Pre-allocated shimmer pool — seeded once on mount, never inside draw loop
const SHIMMER_POOL = Array.from({ length: 20 }, () => ({
  offsetX: 0,
  offsetY: 0,
  radius: 0,
}))

// ── Component ─────────────────────────────────────────────────────────────────
const HandOverlay = forwardRef<HandOverlayHandle, Props>(
  ({ width, height }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Seed shimmer pool once — no Math.random() in the hot draw loop
    useEffect(() => {
      for (const p of SHIMMER_POOL) {
        p.offsetX = (Math.random() - 0.5) * 14
        p.offsetY = (Math.random() - 0.5) * 14
        p.radius = Math.random() * 2.5 + 0.5
      }
    }, [])

    // Expose draw() to parent via ref — called directly from rAF loop
    useImperativeHandle(ref, () => ({
      draw(trackingResult: HandTrackingResult, trail: TrailPoint[]) {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Always clear first
        ctx.clearRect(0, 0, width, height)

        const safeTrail = Array.isArray(trail) ? trail : []
        const safeLandmarks = trackingResult?.allLandmarks ?? []
        const safeWandTip = trackingResult?.wandTip ?? null
        const safeTracking = trackingResult?.isTracking ?? false

        // ── TRAIL ─────────────────────────────────────────────────────────
        if (safeTrail.length > 2) {
          const first = safeTrail[0]
          const last = safeTrail[safeTrail.length - 1]

          // Main smooth bezier trail
          ctx.beginPath()
          ctx.moveTo(first.x * width, first.y * height)

          for (let i = 1; i < safeTrail.length - 1; i++) {
            const midX = ((safeTrail[i].x + safeTrail[i + 1].x) / 2) * width
            const midY = ((safeTrail[i].y + safeTrail[i + 1].y) / 2) * height
            ctx.quadraticCurveTo(
              safeTrail[i].x * width,
              safeTrail[i].y * height,
              midX,
              midY,
            )
          }
          ctx.lineTo(last.x * width, last.y * height)

          const grad = ctx.createLinearGradient(
            first.x * width,
            first.y * height,
            last.x * width,
            last.y * height,
          )
          grad.addColorStop(0, "rgba(120, 60, 255, 0.0)")
          grad.addColorStop(0.4, "rgba(160, 80, 255, 0.4)")
          grad.addColorStop(0.8, "rgba(255, 160, 30, 0.75)")
          grad.addColorStop(1.0, "rgba(255, 220, 60, 1.0)")

          ctx.strokeStyle = grad
          ctx.lineWidth = 4
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          ctx.stroke()

          // Glow pass — newest 50% of trail only
          const glowTrail = safeTrail.slice(Math.floor(safeTrail.length * 0.5))

          if (glowTrail.length > 2) {
            ctx.save()
            ctx.filter = "blur(5px)"
            ctx.globalAlpha = 0.55
            ctx.beginPath()
            ctx.moveTo(glowTrail[0].x * width, glowTrail[0].y * height)

            for (let i = 1; i < glowTrail.length - 1; i++) {
              const midX = ((glowTrail[i].x + glowTrail[i + 1].x) / 2) * width
              const midY = ((glowTrail[i].y + glowTrail[i + 1].y) / 2) * height
              ctx.quadraticCurveTo(
                glowTrail[i].x * width,
                glowTrail[i].y * height,
                midX,
                midY,
              )
            }

            const glowLast = glowTrail[glowTrail.length - 1]
            ctx.lineTo(glowLast.x * width, glowLast.y * height)
            ctx.strokeStyle = "rgba(255, 200, 50, 0.9)"
            ctx.lineWidth = 14
            ctx.lineCap = "round"
            ctx.lineJoin = "round"
            ctx.stroke()
            ctx.restore()
          }

          // Shimmer particles — from pre-seeded pool, zero allocations
          ctx.save()
          const shimmerStart = Math.floor(safeTrail.length * 0.6)
          let poolIdx = 0

          for (
            let i = shimmerStart;
            i < safeTrail.length && poolIdx < SHIMMER_POOL.length;
            i += 2
          ) {
            const point = safeTrail[i]
            if (!point) continue
            const p = SHIMMER_POOL[poolIdx++]
            const progress = i / safeTrail.length

            ctx.beginPath()
            ctx.arc(
              point.x * width + p.offsetX,
              point.y * height + p.offsetY,
              p.radius,
              0,
              Math.PI * 2,
            )
            ctx.fillStyle = `rgba(255, 240, 180, ${progress * 0.85})`
            ctx.fill()
          }
          ctx.restore()
        }

        // ── SKELETON ──────────────────────────────────────────────────────
        if (safeTracking && safeLandmarks.length > 0) {
          ctx.strokeStyle = "rgba(100, 200, 255, 0.45)"
          ctx.lineWidth = 1.5

          for (const [a, b] of HAND_CONNECTIONS) {
            const lmA = safeLandmarks[a]
            const lmB = safeLandmarks[b]
            if (!lmA || !lmB) continue
            ctx.beginPath()
            ctx.moveTo(lmA.x * width, lmA.y * height)
            ctx.lineTo(lmB.x * width, lmB.y * height)
            ctx.stroke()
          }

          for (const lm of safeLandmarks) {
            if (!lm) continue
            ctx.beginPath()
            ctx.arc(lm.x * width, lm.y * height, 3, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(100, 200, 255, 0.65)"
            ctx.fill()
          }
        }

        // ── WAND TIP ──────────────────────────────────────────────────────
        if (safeWandTip) {
          const cx = safeWandTip.x * width
          const cy = safeWandTip.y * height

          // Outer glow
          const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26)
          glow.addColorStop(0, "rgba(255, 220, 60, 0.95)")
          glow.addColorStop(0.4, "rgba(255, 140, 0, 0.45)")
          glow.addColorStop(1, "rgba(255, 80, 0, 0)")

          ctx.beginPath()
          ctx.arc(cx, cy, 26, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()

          // Inner core
          ctx.beginPath()
          ctx.arc(cx, cy, 5, 0, Math.PI * 2)
          ctx.fillStyle = "#ffffff"
          ctx.fill()

          // Sparkle cross
          const s = 9
          ctx.strokeStyle = "rgba(255, 255, 255, 0.85)"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(cx - s, cy)
          ctx.lineTo(cx + s, cy)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(cx, cy - s)
          ctx.lineTo(cx, cy + s)
          ctx.stroke()

          const d = s * 0.6
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"
          ctx.beginPath()
          ctx.moveTo(cx - d, cy - d)
          ctx.lineTo(cx + d, cy + d)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(cx + d, cy - d)
          ctx.lineTo(cx - d, cy + d)
          ctx.stroke()
        }
      },
    }))

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    )
  },
)

HandOverlay.displayName = "HandOverlay"
export default HandOverlay
