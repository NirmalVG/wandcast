"use client"
import { useEffect, useRef } from "react"

export default function VisualizerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth || 400
    canvas.height = 140

    let t = 0
    const trail: { x: number; y: number }[] = []
    let animId: number

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.025

      const nx = Math.sin(t * 1.3) * 0.35 + Math.sin(t * 0.7) * 0.15 + 0.5
      const ny = Math.cos(t * 1.1) * 0.3 + Math.cos(t * 0.5) * 0.1 + 0.5
      trail.push({ x: nx * canvas.width, y: ny * canvas.height })
      if (trail.length > 60) trail.shift()

      if (trail.length > 2) {
        ctx.beginPath()
        ctx.moveTo(trail[0].x, trail[0].y)
        for (let i = 1; i < trail.length - 1; i++) {
          const mx = (trail[i].x + trail[i + 1].x) / 2
          const my = (trail[i].y + trail[i + 1].y) / 2
          ctx.quadraticCurveTo(trail[i].x, trail[i].y, mx, my)
        }
        const last = trail[trail.length - 1]
        ctx.lineTo(last.x, last.y)

        const grad = ctx.createLinearGradient(
          trail[0].x,
          trail[0].y,
          last.x,
          last.y,
        )
        grad.addColorStop(0, "rgba(120,60,255,0.0)")
        grad.addColorStop(0.5, "rgba(160,80,255,0.4)")
        grad.addColorStop(1.0, "rgba(240,180,41,0.9)")
        ctx.strokeStyle = grad
        ctx.lineWidth = 2.5
        ctx.lineCap = "round"
        ctx.stroke()

        // Tip Dot
        ctx.beginPath()
        ctx.arc(last.x, last.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = "#fff"
        ctx.fill()
      }
      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full bg-[#0a0804]/80" />
}
