import type { NormalizedPoint } from "@/lib/gesture/normalize"
import type { SpellName } from "@/types"

// Each template is 32 normalized points representing the ideal gesture path
export const SPELL_TEMPLATES: Record<SpellName, NormalizedPoint[]> = {
  lumos: generateAlphaLoop(32),

  // Nox — straight downward sweep ↓
  nox: generateArc("top", 32),

  // Accio — curved pull toward you ←
  accio: generateArc("left", 32),

  // Expelliarmus — sharp flick right then down ↗↘
  expelliarmus: generateZigzag(
    [
      [0, 0],
      [0.8, -0.5],
      [0.3, 0.5],
    ],
    32,
  ),

  // Stupefy — fast zigzag →←→
  stupefy: generateZigzag(
    [
      [-0.8, 0],
      [0.8, 0.3],
      [-0.5, -0.3],
    ],
    32,
  ),

  // Protego — clockwise circle ○
  protego: generateCircle("clockwise", 32),

  // Wingardium — swish (S-curve) then upward flick
  wingardium: generateSCurve(32),

  // Patronum — large flowing S-curve
  patronum: generateSCurve(32, 1.5),
}

// ── Shape generators ─────────────────────────────────────────────────────────

function generateLine(
  from: [number, number],
  to: [number, number],
  count: number,
): NormalizedPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    return {
      x: from[0] + (to[0] - from[0]) * t,
      y: from[1] + (to[1] - from[1]) * t,
    }
  })
}

function generateCircle(
  direction: "clockwise" | "counterclockwise",
  count: number,
): NormalizedPoint[] {
  const dir = direction === "clockwise" ? 1 : -1
  return Array.from({ length: count }, (_, i) => {
    const angle = dir * (i / count) * Math.PI * 2
    return {
      x: Math.cos(angle) * 0.8,
      y: Math.sin(angle) * 0.8,
    }
  })
}

function generateArc(
  side: "left" | "right" | "top",
  count: number,
): NormalizedPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    const angle = Math.PI * t

    if (side === "top") {
      // Draws an arch (Dome). Starts mid-left, arcs up, ends mid-right.
      return {
        x: -0.8 + t * 1.6,
        y: -Math.sin(angle) * 0.8,
      }
    }

    const dir = side === "left" ? -1 : 1
    return {
      x: dir * Math.sin(angle) * 0.8,
      y: 0.8 - t * 1.6,
    }
  })
}

function generateZigzag(
  waypoints: [number, number][],
  count: number,
): NormalizedPoint[] {
  const points: NormalizedPoint[] = []
  const perSegment = Math.floor(count / (waypoints.length - 1))

  for (let seg = 0; seg < waypoints.length - 1; seg++) {
    const from = waypoints[seg]
    const to = waypoints[seg + 1]
    for (let i = 0; i < perSegment; i++) {
      const t = i / perSegment
      points.push({
        x: from[0] + (to[0] - from[0]) * t,
        y: from[1] + (to[1] - from[1]) * t,
      })
    }
  }

  while (points.length < count) {
    points.push(points[points.length - 1])
  }

  return points.slice(0, count)
}

function generateSCurve(count: number, scale = 1): NormalizedPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    return {
      x: Math.sin(t * Math.PI * 2) * 0.6 * scale,
      y: (0.8 - t * 1.6) * scale,
    }
  })
}

function generateAlphaLoop(count: number): NormalizedPoint[] {
  return Array.from({ length: count }, (_, i) => {
    // t goes from 0 to 2π
    const t = (i / (count - 1)) * Math.PI * 2
    return {
      // Lissajous curve math to create a perfect overlapping ribbon/alpha shape
      x: Math.sin(t) * 0.8,
      y: Math.sin(2 * t) * -0.8,
    }
  })
}
