"use client"

import { useRef, useCallback } from "react"
import { TRAIL_LENGTH } from "@/lib/mediapipe/config"
import type { WandPoint } from "@/types"

export interface TrailPoint {
  x: number
  y: number
  timestamp: number
}

export function useWandTrail() {
  // Ring buffer as ref — mutations don't trigger re-renders (intentional)
  const trailRef = useRef<TrailPoint[]>([])

  // Call every frame when hand is visible
  const addPoint = useCallback((point: WandPoint) => {
    // Guard — ignore invalid points
    if (
      point == null ||
      typeof point.x !== "number" ||
      typeof point.y !== "number"
    )
      return

    const newPoint: TrailPoint = {
      x: point.x,
      y: point.y,
      timestamp: Date.now(),
    }

    // Keep last (TRAIL_LENGTH - 1) points, add newest at end
    trailRef.current = [
      ...trailRef.current.slice(-(TRAIL_LENGTH - 1)),
      newPoint,
    ]
  }, [])

  // Call when hand leaves frame
  const clearTrail = useCallback(() => {
    trailRef.current = []
  }, [])

  // Returns snapshot for drawing — always returns an array
  const getTrail = useCallback((): TrailPoint[] => {
    return trailRef.current ?? []
  }, [])

  return { addPoint, clearTrail, getTrail, trailRef }
}
