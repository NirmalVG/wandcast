"use client"

import { useEffect, useRef } from "react"
import type { SpellName, WandPoint } from "@/types"

interface Props {
  spell: SpellName
  wandTip: WandPoint
  canvasWidth: number
  canvasHeight: number
  onComplete: () => void
}

interface SpellConfig {
  particleCount: number
  dustCount: number
  durationMs: number
  colors: string[]
  accentColor: string
  glowColor: string
  motion:
    | "burst"
    | "implode"
    | "projectile"
    | "orbit"
    | "stream"
    | "rise"
    | "patronus"
  spread: number
  trailLength: number
  coreGrowth: number
}

interface Particle {
  x: number
  y: number
  previousX: number
  previousY: number
  size: number
  color: string
  angle: number
  radius: number
  speed: number
  drift: number
  wobble: number
  alpha: number
  layer: "spark" | "dust"
  depth: number
  twist: number
}

const SPELL_CONFIG: Record<SpellName, SpellConfig> = {
  lumos: {
    particleCount: 180,
    dustCount: 90,
    durationMs: 1850,
    colors: ["#ffffff", "#fff8c8", "#ffd86b", "#f0b429"],
    accentColor: "#fff3af",
    glowColor: "rgba(255,210,90,0.48)",
    motion: "burst",
    spread: 170,
    trailLength: 20,
    coreGrowth: 16,
  },
  nox: {
    particleCount: 140,
    dustCount: 80,
    durationMs: 1250,
    colors: ["#6b4c91", "#3c2459", "#1b102b", "#09060f"],
    accentColor: "#8f6eb5",
    glowColor: "rgba(76,44,111,0.32)",
    motion: "implode",
    spread: 220,
    trailLength: 14,
    coreGrowth: 10,
  },
  accio: {
    particleCount: 170,
    dustCount: 100,
    durationMs: 1525,
    colors: ["#ffffff", "#dffeff", "#aef7ff", "#64c8ff"],
    accentColor: "#bdf8ff",
    glowColor: "rgba(100,200,255,0.38)",
    motion: "stream",
    spread: 260,
    trailLength: 28,
    coreGrowth: 12,
  },
  expelliarmus: {
    particleCount: 160,
    dustCount: 90,
    durationMs: 1260,
    colors: ["#fff3b0", "#ffb35c", "#ff7840", "#ff422d"],
    accentColor: "#ffd18c",
    glowColor: "rgba(255,120,64,0.4)",
    motion: "projectile",
    spread: 240,
    trailLength: 26,
    coreGrowth: 14,
  },
  stupefy: {
    particleCount: 165,
    dustCount: 85,
    durationMs: 1160,
    colors: ["#ffe2e2", "#ff8f8f", "#ff4d5d", "#a51022"],
    accentColor: "#ffc1c1",
    glowColor: "rgba(255,77,93,0.42)",
    motion: "projectile",
    spread: 210,
    trailLength: 24,
    coreGrowth: 12,
  },
  protego: {
    particleCount: 120,
    dustCount: 100,
    durationMs: 1660,
    colors: ["#d9f4ff", "#8fd9ff", "#59b4ff", "#2b83ff"],
    accentColor: "#dff7ff",
    glowColor: "rgba(89,180,255,0.32)",
    motion: "orbit",
    spread: 180,
    trailLength: 16,
    coreGrowth: 10,
  },
  wingardium: {
    particleCount: 150,
    dustCount: 120,
    durationMs: 1980,
    colors: ["#fff8d6", "#dbffbb", "#9ce7ff", "#7cffd0"],
    accentColor: "#f2ffd8",
    glowColor: "rgba(184,255,154,0.34)",
    motion: "rise",
    spread: 190,
    trailLength: 18,
    coreGrowth: 14,
  },
  patronum: {
    particleCount: 220,
    dustCount: 160,
    durationMs: 2280,
    colors: ["#ffffff", "#ecfbff", "#cdefff", "#8dd7ff"],
    accentColor: "#ffffff",
    glowColor: "rgba(205,239,255,0.5)",
    motion: "patronus",
    spread: 230,
    trailLength: 30,
    coreGrowth: 18,
  },
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function sample<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function alphaColor(hex: string, alpha: number) {
  if (!hex.startsWith("#")) return `rgba(255,255,255,${alpha})`

  const value = hex.slice(1)
  const size = value.length === 3 ? 1 : 2
  const read = (index: number) => {
    const part = value.slice(index * size, index * size + size)
    const expanded = size === 1 ? `${part}${part}` : part
    return Number.parseInt(expanded, 16)
  }

  return `rgba(${read(0)}, ${read(1)}, ${read(2)}, ${alpha})`
}

export default function BaseSpellEffect({
  spell,
  wandTip,
  canvasWidth,
  canvasHeight,
  onComplete,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = canvasWidth * ratio
    canvas.height = canvasHeight * ratio
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

    const config = SPELL_CONFIG[spell]
    const centerX = wandTip.x * canvasWidth
    const centerY = wandTip.y * canvasHeight

    const createParticle = (layer: "spark" | "dust"): Particle => {
      const angle = randomBetween(0, Math.PI * 2)
      const radius =
        layer === "spark"
          ? randomBetween(0, config.spread * 0.55)
          : randomBetween(config.spread * 0.15, config.spread)

      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      return {
        x,
        y,
        previousX: x,
        previousY: y,
        size:
          layer === "spark" ? randomBetween(2.2, 6.5) : randomBetween(0.8, 2.4),
        color:
          layer === "spark" ? sample(config.colors) : sample(config.colors.slice(1)),
        angle,
        radius,
        speed:
          layer === "spark" ? randomBetween(1.2, 5.8) : randomBetween(0.4, 1.8),
        drift: randomBetween(-1.2, 1.2),
        wobble: randomBetween(-1, 1),
        alpha: layer === "spark" ? 1 : randomBetween(0.25, 0.7),
        layer,
        depth:
          layer === "spark" ? randomBetween(0.55, 1.45) : randomBetween(0.25, 1.1),
        twist: randomBetween(-1, 1),
      }
    }

    const particles: Particle[] = [
      ...Array.from({ length: config.particleCount }, () => createParticle("spark")),
      ...Array.from({ length: config.dustCount }, () => createParticle("dust")),
    ]

    const startedAt = performance.now()
    let frameId = 0

    const getCorePosition = (progress: number) => {
      switch (config.motion) {
        case "projectile":
        case "stream":
          return {
            x: centerX + progress * config.spread * 0.9,
            y: centerY,
          }
        case "rise":
        case "patronus":
          return {
            x: centerX,
            y: centerY - progress * config.spread * 0.35,
          }
        default:
          return { x: centerX, y: centerY }
      }
    }

    const drawAtmosphere = (progress: number, inverse: number) => {
      const primaryRadius =
        config.motion === "implode"
          ? config.spread * inverse * 0.55 + 20
          : 30 + progress * config.spread * 0.6
      const secondaryRadius = primaryRadius * 1.55
      const { x: coreX, y: coreY } = getCorePosition(progress)

      const glow = ctx.createRadialGradient(
        coreX,
        coreY,
        0,
        coreX,
        coreY,
        primaryRadius,
      )
      glow.addColorStop(0, config.glowColor)
      glow.addColorStop(0.45, config.glowColor.replace(/0\.\d+\)/, "0.18)"))
      glow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(coreX, coreY, primaryRadius, 0, Math.PI * 2)
      ctx.fill()

      const haze = ctx.createRadialGradient(
        coreX,
        coreY,
        primaryRadius * 0.2,
        coreX,
        coreY,
        secondaryRadius,
      )
      haze.addColorStop(0, "rgba(255,255,255,0.08)")
      haze.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = haze
      ctx.beginPath()
      ctx.arc(coreX, coreY, secondaryRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = inverse * 0.75
      ctx.strokeStyle = config.accentColor
      ctx.lineWidth = 2.5 + inverse * 3
      ctx.beginPath()
      ctx.arc(
        coreX,
        coreY,
        config.motion === "implode"
          ? config.spread * inverse * 0.38 + 10
          : 14 + progress * config.spread * 0.32,
        0,
        Math.PI * 2,
      )
      ctx.stroke()
      ctx.globalAlpha = 1

      ctx.save()
      ctx.globalAlpha = inverse * 0.24
      ctx.strokeStyle = alphaColor(config.accentColor, 0.6)
      ctx.lineWidth = 1.2
      for (let index = 0; index < 3; index += 1) {
        const offset = index * Math.PI * 0.66 + progress * 2.5
        ctx.beginPath()
        for (let step = 0; step <= 22; step += 1) {
          const t = step / 22
          const orbitRadius = primaryRadius * (0.45 + t * 0.35)
          const x = coreX + Math.cos(offset + t * Math.PI * 2.4) * orbitRadius
          const y = coreY + Math.sin(offset * 0.7 + t * Math.PI * 1.8) * orbitRadius * 0.55
          if (step === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }
      ctx.restore()
    }

    const drawCore = (progress: number, inverse: number) => {
      const { x: coreX, y: coreY } = getCorePosition(progress)
      const coreRadius = 8 + progress * config.coreGrowth

      ctx.save()
      ctx.shadowBlur = 28
      ctx.shadowColor = config.accentColor
      ctx.globalAlpha = inverse * 0.96

      const gradient = ctx.createRadialGradient(
        coreX,
        coreY,
        0,
        coreX,
        coreY,
        coreRadius * 1.9,
      )
      gradient.addColorStop(0, "#ffffff")
      gradient.addColorStop(0.35, config.accentColor)
      gradient.addColorStop(1, "rgba(255,255,255,0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(coreX, coreY, coreRadius * 1.9, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(coreX, coreY, coreRadius * 0.42, 0, Math.PI * 2)
      ctx.fill()

      const star = coreRadius * 1.2
      ctx.strokeStyle = "rgba(255,255,255,0.88)"
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(coreX - star, coreY)
      ctx.lineTo(coreX + star, coreY)
      ctx.moveTo(coreX, coreY - star)
      ctx.lineTo(coreX, coreY + star)
      ctx.stroke()
      ctx.restore()
    }

    const drawLensFlare = (progress: number, inverse: number) => {
      const { x: coreX, y: coreY } = getCorePosition(progress)
      const radius = 28 + progress * config.coreGrowth * 2

      ctx.save()
      ctx.globalCompositeOperation = "screen"
      ctx.globalAlpha = inverse * 0.22
      ctx.strokeStyle = alphaColor(config.accentColor, 0.45)
      ctx.lineWidth = 1

      ctx.beginPath()
      ctx.moveTo(coreX - radius * 1.7, coreY)
      ctx.lineTo(coreX + radius * 1.7, coreY)
      ctx.moveTo(coreX, coreY - radius * 1.7)
      ctx.lineTo(coreX, coreY + radius * 1.7)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(coreX - radius, coreY - radius)
      ctx.lineTo(coreX + radius, coreY + radius)
      ctx.moveTo(coreX + radius, coreY - radius)
      ctx.lineTo(coreX - radius, coreY + radius)
      ctx.stroke()
      ctx.restore()
    }

    const updateParticle = (particle: Particle, progress: number, inverse: number) => {
      particle.previousX = particle.x
      particle.previousY = particle.y

      const depthRadius = particle.radius * particle.depth
      const parallax = 0.8 + particle.depth * 0.45
      const twist = particle.twist * (particle.layer === "spark" ? 12 : 20)

      switch (config.motion) {
        case "burst":
          particle.x =
            centerX +
            Math.cos(particle.angle) *
              (depthRadius + progress * config.spread * particle.speed * 0.22 * parallax)
          particle.y =
            centerY +
            Math.sin(particle.angle) *
              (depthRadius + progress * config.spread * particle.speed * 0.22 * parallax)
          break
        case "implode":
          particle.x =
            centerX + Math.cos(particle.angle + progress * (8.5 + particle.depth)) * (depthRadius * inverse)
          particle.y =
            centerY + Math.sin(particle.angle + progress * (8.5 + particle.depth)) * (depthRadius * inverse)
          break
        case "projectile":
          particle.x =
            centerX +
            progress * config.spread * 1.22 * parallax +
            Math.cos(particle.angle * 3 + progress * 4) *
              (particle.layer === "spark" ? 18 : 28) *
              inverse
          particle.y =
            centerY +
            Math.sin(particle.angle) * (particle.layer === "spark" ? 20 : 34) * inverse +
            particle.wobble * (particle.layer === "spark" ? 14 : 24) +
            twist
          break
        case "orbit":
          particle.x =
            centerX +
            Math.cos(particle.angle + progress * (particle.layer === "spark" ? 8 : 5.5)) *
              (34 + depthRadius * (particle.layer === "spark" ? 0.34 : 0.46))
          particle.y =
            centerY +
            Math.sin(particle.angle + progress * (particle.layer === "spark" ? 8 : 5.5)) *
              (26 + depthRadius * (particle.layer === "spark" ? 0.24 : 0.34))
          break
        case "stream":
          particle.x =
            centerX - config.spread + progress * config.spread * 1.14 +
            Math.cos(progress * Math.PI * 3 + particle.angle) *
              (particle.layer === "spark" ? 10 : 22) * parallax
          particle.y =
            centerY +
            Math.sin(progress * Math.PI * 2 + particle.angle) *
              (particle.layer === "spark" ? 18 : 28) * parallax +
            particle.wobble * (particle.layer === "spark" ? 10 : 20) +
            twist * 0.45
          break
        case "rise":
          particle.x =
            centerX +
            Math.sin(progress * Math.PI * 2 + particle.angle) *
              (18 + depthRadius * (particle.layer === "spark" ? 0.22 : 0.34))
          particle.y =
            centerY -
            progress * config.spread * parallax +
            Math.cos(particle.angle) * (particle.layer === "spark" ? 18 : 30)
          break
        case "patronus":
          particle.x =
            centerX +
            Math.cos(particle.angle + progress * 10) *
              (28 + depthRadius * (particle.layer === "spark" ? 0.5 : 0.62))
          particle.y =
            centerY -
            progress * config.spread * 0.52 * parallax +
            Math.sin((particle.angle + progress * 10) * 1.5) *
              (15 + depthRadius * (particle.layer === "spark" ? 0.28 : 0.42))
          break
      }

      particle.alpha =
        config.motion === "implode"
          ? clamp(Math.min(progress * 2.2, 1) * inverse, 0, 1)
          : clamp(
              inverse * (particle.layer === "spark" ? 1 : 0.7) * (0.72 + particle.depth * 0.28),
              0,
              1,
            )
    }

    const drawParticle = (particle: Particle) => {
      if (particle.alpha <= 0.01) return

      const trailAlpha = particle.alpha * (particle.layer === "spark" ? 0.4 : 0.16)
      const renderedSize =
        particle.size *
        (particle.layer === "spark" ? 0.8 + particle.depth * 0.55 : 0.75 + particle.depth * 0.4)
      ctx.save()
      ctx.globalAlpha = trailAlpha
      ctx.strokeStyle = particle.color
      ctx.lineWidth = particle.layer === "spark" ? renderedSize * 0.9 : renderedSize * 0.55
      ctx.lineCap = "round"
      ctx.shadowBlur = particle.layer === "spark" ? 18 + particle.depth * 8 : 8 + particle.depth * 4
      ctx.shadowColor = particle.color
      ctx.beginPath()
      ctx.moveTo(particle.previousX, particle.previousY)
      ctx.lineTo(particle.x, particle.y)
      ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.globalAlpha = particle.alpha
      ctx.fillStyle = particle.color
      ctx.shadowBlur = particle.layer === "spark" ? 22 + particle.depth * 12 : 10 + particle.depth * 6
      ctx.shadowColor = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, renderedSize, 0, Math.PI * 2)
      ctx.fill()

      if (particle.layer === "spark") {
        ctx.globalAlpha = particle.alpha * 0.55
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, renderedSize * 0.38, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    const animate = () => {
      const elapsed = performance.now() - startedAt
      const progress = Math.min(elapsed / config.durationMs, 1)
      const inverse = 1 - progress

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      drawAtmosphere(progress, inverse)

      for (const particle of particles) {
        updateParticle(particle, progress, inverse)
      }

      for (const particle of particles.filter((particle) => particle.layer === "dust")) {
        drawParticle(particle)
      }

      drawCore(progress, inverse)
      drawLensFlare(progress, inverse)

      for (const particle of particles.filter((particle) => particle.layer === "spark")) {
        drawParticle(particle)
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      } else {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        onComplete()
      }
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [canvasHeight, canvasWidth, onComplete, spell, wandTip])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block pointer-events-none"
    />
  )
}
