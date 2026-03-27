"use client"
import { useEffect, useRef } from "react"

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const isMobile = window.innerWidth <= 768
    const N = isMobile ? 40 : 60
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * (isMobile ? 2.5 : 1.5) + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18 - 0.05,
      a: Math.random(),
      da: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
      gold: Math.random() > 0.6,
    }))

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.a += p.da
        if (p.a <= 0 || p.a >= 1) p.da *= -1
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas.height + 10
        if (p.y > canvas.height + 10) p.y = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.gold
          ? `rgba(240,180,41,${p.a * 0.7})`
          : `rgba(200,170,120,${p.a * 0.3})`

        if (p.gold && p.r > 1.5) {
          ctx.shadowColor = "rgba(240,180,41,0.6)"
          ctx.shadowBlur = 8
        } else {
          ctx.shadowBlur = 0
        }
        ctx.fill()
      })
      animId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
  )
}
