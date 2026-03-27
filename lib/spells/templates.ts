import type { NormalizedPoint } from "@/lib/gesture/normalize"
import type { SpellName } from "@/types"

// Each template is 32 normalized points representing the ideal gesture path.
// Coordinates are in the range -1.0 to 1.0 after normalization.
export const SPELL_TEMPLATES: Record<SpellName, NormalizedPoint[]> = {
  // Lumos — straight upward flick
  lumos: generateLine([0, 0.8], [0, -0.8], 32),

  // Nox — straight downward sweep
  nox: generateLine([0, -0.8], [0, 0.8], 32),

  // Accio — curved pull left
  accio: generateArc("left", 32),

  // Expelliarmus — sharp flick right then down
  expelliarmus: generateZigzag(
    [
      [0, 0],
      [0.8, -0.5],
      [0.3, 0.5],
    ],
    32,
  ),

  // Stupefy — fast zigzag left-right-left
  stupefy: generateZigzag(
    [
      [-0.8, 0],
      [0.8, 0.3],
      [-0.5, -0.3],
    ],
    32,
  ),

  // Protego — clockwise circle
  protego: generateCircle("clockwise", 32),

  // Wingardium — S-curve swish then flick
  wingardium: generateSCurve(32, 1.0),

  // Patronum — large flowing S-curve
  patronum: generateSCurve(32, 1.5),
}

// ── Shape Generators ──────────────────────────────────────────────────────────

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

function generateArc(side: "left" | "right", count: number): NormalizedPoint[] {
  const dir = side === "left" ? -1 : 1
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    const angle = Math.PI * t
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

  // Fill to exact count with last point
  while (points.length < count) {
    points.push(points[points.length - 1])
  }

  return points.slice(0, count)
}

function generateSCurve(count: number, scale: number = 1): NormalizedPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    return {
      x: Math.sin(t * Math.PI * 2) * 0.6 * scale,
      y: (0.8 - t * 1.6) * scale,
    }
  })
}
