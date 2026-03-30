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
  cameraWidth: number
  cameraHeight: number
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

// ── Object-cover math ─────────────────────────────────────────────────────────
// Computes the same scale + offset the browser applies to <video style="object-fit:cover">
// so the canvas skeleton aligns pixel-perfect with the visible video feed.
function computeCoverTransform(
  viewW: number,
  viewH: number,
  camW: number,
  camH: number,
) {
  const viewAspect = viewW / viewH
  const camAspect = camW / camH

  let scale: number
  let offsetX: number
  let offsetY: number

  if (viewAspect > camAspect) {
    // Viewport is wider than camera — camera height is cropped
    scale = viewW / camW
    offsetX = 0
    offsetY = (viewH - camH * scale) / 2
  } else {
    // Viewport is taller than camera — camera width is cropped
    scale = viewH / camH
    offsetX = (viewW - camW * scale) / 2
    offsetY = 0
  }

  return { scale, offsetX, offsetY }
}

// Convert a normalized landmark (0–1) to pixel position matching object-cover
function landmarkToPixel(
  nx: number,
  ny: number,
  camW: number,
  camH: number,
  scale: number,
  offsetX: number,
  offsetY: number,
) {
  return {
    px: nx * camW * scale + offsetX,
    py: ny * camH * scale + offsetY,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
const HandOverlay = forwardRef<HandOverlayHandle, Props>(
  ({ width, height, cameraWidth, cameraHeight }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Seed shimmer pool once — no Math.random() in the hot draw loop
    useEffect(() => {
      for (const p of SHIMMER_POOL) {
        p.offsetX = (Math.random() - 0.5) * 14
        p.offsetY = (Math.random() - 0.5) * 14
        p.radius = Math.random() * 2.5 + 0.5
      }
    }, [])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Apply device pixel ratio for crisp rendering on high-DPI displays
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
      canvas.width = width * dpr
      canvas.height = height * dpr

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }, [width, height])

    // Expose draw() to parent via ref — called directly from rAF loop
    useImperativeHandle(ref, () => ({
      draw(trackingResult: HandTrackingResult, trail: TrailPoint[]) {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Always clear first
        ctx.clearRect(0, 0, width, height)

        // Compute object-cover transform to match video scaling
        const { scale, offsetX, offsetY } = computeCoverTransform(
          width,
          height,
          cameraWidth,
          cameraHeight,
        )

        // Helper: convert normalized coords to pixel coords
        const toPixel = (nx: number, ny: number) =>
          landmarkToPixel(nx, ny, cameraWidth, cameraHeight, scale, offsetX, offsetY)

        const safeTrail = Array.isArray(trail) ? trail : []
        const safeLandmarks = trackingResult?.allLandmarks ?? []
        const safeWandTip = trackingResult?.wandTip ?? null
        const safeTracking = trackingResult?.isTracking ?? false

        // ── TRAIL ─────────────────────────────────────────────────────────
        if (safeTrail.length > 2) {
          const firstPx = toPixel(safeTrail[0].x, safeTrail[0].y)
          const lastPx = toPixel(
            safeTrail[safeTrail.length - 1].x,
            safeTrail[safeTrail.length - 1].y,
          )

          // Main smooth bezier trail
          ctx.beginPath()
          ctx.moveTo(firstPx.px, firstPx.py)

          for (let i = 1; i < safeTrail.length - 1; i++) {
            const curr = toPixel(safeTrail[i].x, safeTrail[i].y)
            const next = toPixel(safeTrail[i + 1].x, safeTrail[i + 1].y)
            const midX = (curr.px + next.px) / 2
            const midY = (curr.py + next.py) / 2
            ctx.quadraticCurveTo(curr.px, curr.py, midX, midY)
          }
          ctx.lineTo(lastPx.px, lastPx.py)

          const grad = ctx.createLinearGradient(
            firstPx.px,
            firstPx.py,
            lastPx.px,
            lastPx.py,
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
            const gFirst = toPixel(glowTrail[0].x, glowTrail[0].y)
            ctx.moveTo(gFirst.px, gFirst.py)

            for (let i = 1; i < glowTrail.length - 1; i++) {
              const curr = toPixel(glowTrail[i].x, glowTrail[i].y)
              const next = toPixel(glowTrail[i + 1].x, glowTrail[i + 1].y)
              const midX = (curr.px + next.px) / 2
              const midY = (curr.py + next.py) / 2
              ctx.quadraticCurveTo(curr.px, curr.py, midX, midY)
            }

            const gLast = toPixel(
              glowTrail[glowTrail.length - 1].x,
              glowTrail[glowTrail.length - 1].y,
            )
            ctx.lineTo(gLast.px, gLast.py)
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
            const ptPx = toPixel(point.x, point.y)

            ctx.beginPath()
            ctx.arc(
              ptPx.px + p.offsetX,
              ptPx.py + p.offsetY,
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
          // Compute hand bounding box in screen pixels to scale line width
          let minPx = Infinity, maxPx = -Infinity
          let minPy = Infinity, maxPy = -Infinity
          for (const lm of safeLandmarks) {
            if (!lm) continue
            const { px, py } = toPixel(lm.x, lm.y)
            if (px < minPx) minPx = px
            if (px > maxPx) maxPx = px
            if (py < minPy) minPy = py
            if (py > maxPy) maxPy = py
          }
          const handScreenSize = Math.max(maxPx - minPx, maxPy - minPy, 1)

          // Scale line width proportionally — ~3% of hand size, clamped for usability
          const lineWidth = Math.max(2, Math.min(12, handScreenSize * 0.03))
          const jointRadius = Math.max(2.5, Math.min(10, handScreenSize * 0.025))

          ctx.strokeStyle = "rgba(100, 200, 255, 0.45)"
          ctx.lineWidth = lineWidth
          ctx.lineCap = "round"
          ctx.lineJoin = "round"

          for (const [a, b] of HAND_CONNECTIONS) {
            const lmA = safeLandmarks[a]
            const lmB = safeLandmarks[b]
            if (!lmA || !lmB) continue
            const pA = toPixel(lmA.x, lmA.y)
            const pB = toPixel(lmB.x, lmB.y)
            ctx.beginPath()
            ctx.moveTo(pA.px, pA.py)
            ctx.lineTo(pB.px, pB.py)
            ctx.stroke()
          }

          for (const lm of safeLandmarks) {
            if (!lm) continue
            const { px, py } = toPixel(lm.x, lm.y)
            ctx.beginPath()
            ctx.arc(px, py, jointRadius, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(100, 200, 255, 0.65)"
            ctx.fill()
          }
        }

        // ── WAND TIP ──────────────────────────────────────────────────────
        if (safeWandTip) {
          const { px: cx, py: cy } = toPixel(safeWandTip.x, safeWandTip.y)

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
