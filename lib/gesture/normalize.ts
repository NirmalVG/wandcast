import type { TrailPoint } from "@/hooks/useWandTrail"

export interface NormalizedPoint {
  x: number
  y: number
}

export function normalizeTrajectory(trail: TrailPoint[]): NormalizedPoint[] {
  if (!trail || trail.length < 2) return []

  // Step 1 — Extract just x, y
  const points = trail.map((p) => ({ x: p.x, y: p.y }))

  // Step 2 — Find centroid (center of mass)
  const centroid = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 },
  )
  centroid.x /= points.length
  centroid.y /= points.length

  // Step 3 — Center around origin (subtract centroid)
  const centered = points.map((p) => ({
    x: p.x - centroid.x,
    y: p.y - centroid.y,
  }))

  // Step 4 — Scale to unit size (divide by max distance from center)
  const maxDist = Math.max(
    ...centered.map((p) => Math.sqrt(p.x * p.x + p.y * p.y)),
  )

  if (maxDist === 0) return centered // hand didn't move — guard division by zero

  const scaled = centered.map((p) => ({
    x: p.x / maxDist,
    y: p.y / maxDist,
  }))

  // Step 5 — Resample to fixed 32 points (DTW works best with equal lengths)
  return resample(scaled, 32)
}

// Resample an array of points to exactly targetCount points
// Interpolates between existing points to fill gaps
function resample(
  points: NormalizedPoint[],
  targetCount: number,
): NormalizedPoint[] {
  if (points.length === targetCount) return points
  if (points.length < 2) return points

  // Calculate total path length
  let totalLength = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    totalLength += Math.sqrt(dx * dx + dy * dy)
  }

  const interval = totalLength / (targetCount - 1)
  const resampled: NormalizedPoint[] = [points[0]]
  let accumulated = 0

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    const segLen = Math.sqrt(dx * dx + dy * dy)

    if (accumulated + segLen >= interval) {
      const t = (interval - accumulated) / segLen
      const newPoint = {
        x: points[i - 1].x + t * dx,
        y: points[i - 1].y + t * dy,
      }
      resampled.push(newPoint)
      points = [newPoint, ...points.slice(i)]
      accumulated = 0
      i = 0 // restart from new point
    } else {
      accumulated += segLen
    }

    if (resampled.length >= targetCount) break
  }

  // Fill any remaining points with the last point
  while (resampled.length < targetCount) {
    resampled.push(points[points.length - 1])
  }

  return resampled.slice(0, targetCount)
}
