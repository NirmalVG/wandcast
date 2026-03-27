import type { NormalizedPoint } from "./normalize"

// Lower distance = more similar. 0 = identical.
export function dtwDistance(
  a: NormalizedPoint[],
  b: NormalizedPoint[],
): number {
  const n = a.length
  const m = b.length

  // Create cost matrix — filled with Infinity
  const dtw: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(Infinity),
  )
  dtw[0][0] = 0

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      // Euclidean distance between these two points
      const dx = a[i - 1].x - b[j - 1].x
      const dy = a[i - 1].y - b[j - 1].y
      const cost = Math.sqrt(dx * dx + dy * dy)

      // Take the cheapest path from 3 neighbors
      dtw[i][j] =
        cost +
        Math.min(
          dtw[i - 1][j], // insertion
          dtw[i][j - 1], // deletion
          dtw[i - 1][j - 1], // match
        )
    }
  }

  return dtw[n][m]
}

// Convert raw DTW distance → 0.0–1.0 confidence score
// Lower distance = higher confidence
export function distanceToConfidence(distance: number): number {
  const maxDistance = 4.0 // was 3.0
  return Math.max(0, 1 - distance / maxDistance)
}
