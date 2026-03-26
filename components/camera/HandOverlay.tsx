"use client"

import { useEffect, useRef } from "react"
import { HandTrackingResult } from "@/hooks/useHandTracking"

interface Props {
  trackingResult: HandTrackingResult
  width: number
  height: number
}

// MediaPipe hand connections — pairs of landmark indices to draw lines between
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // thumb
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // index finger
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12], // middle finger
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16], // ring finger
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20], // pinky
  [5, 9],
  [9, 13],
  [13, 17], // palm
]

export default function HandOverlay({ trackingResult, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear previous frame
    ctx.clearRect(0, 0, width, height)

    if (!trackingResult.isTracking || trackingResult.allLandmarks.length === 0)
      return

    const lms = trackingResult.allLandmarks

    // Draw skeleton lines
    ctx.strokeStyle = "rgba(100, 200, 255, 0.6)"
    ctx.lineWidth = 2

    HAND_CONNECTIONS.forEach(([a, b]) => {
      ctx.beginPath()
      ctx.moveTo(lms[a].x * width, lms[a].y * height)
      ctx.lineTo(lms[b].x * width, lms[b].y * height)
      ctx.stroke()
    })

    // Draw all landmark dots
    lms.forEach((lm, i) => {
      ctx.beginPath()
      ctx.arc(lm.x * width, lm.y * height, 4, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(100, 200, 255, 0.8)"
      ctx.fill()
    })

    // Draw wand tip — bigger, golden glow
    if (trackingResult.wandTip) {
      const { x, y } = trackingResult.wandTip

      // Outer glow
      const gradient = ctx.createRadialGradient(
        x * width,
        y * height,
        0,
        x * width,
        y * height,
        20,
      )
      gradient.addColorStop(0, "rgba(255, 220, 50, 0.9)")
      gradient.addColorStop(1, "rgba(255, 180, 0, 0)")

      ctx.beginPath()
      ctx.arc(x * width, y * height, 20, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Inner dot
      ctx.beginPath()
      ctx.arc(x * width, y * height, 6, 0, Math.PI * 2)
      ctx.fillStyle = "#ffd700"
      ctx.fill()
    }
  }, [trackingResult, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ transform: "scaleX(-1)" }} // mirror for natural feel
    />
  )
}
