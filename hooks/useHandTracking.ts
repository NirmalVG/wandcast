"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import HandsUtils from "@mediapipe/hands"
import type { Results } from "@mediapipe/hands"
import CameraUtils from "@mediapipe/camera_utils"
import {
  MEDIAPIPE_CONFIG,
  CAMERA_CONFIG,
  LANDMARKS,
} from "@/lib/mediapipe/config"
import type { WandPoint, HandTrackingResult } from "@/types"

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const handsRef = useRef<InstanceType<typeof HandsUtils.Hands> | null>(null)
  const cameraRef = useRef<InstanceType<typeof CameraUtils.Camera> | null>(null)

  const [trackingResult, setTrackingResult] = useState<HandTrackingResult>({
    isReady: false,
    isTracking: false,
    wandTip: null,
    allLandmarks: [],
    handedness: null,
  })

  // ─── 1. OPTIMIZED RESULTS HANDLER (Fixes the Infinite Loop) ───
  const onResults = useCallback((results: Results) => {
    // Always ensure isReady is true once we get data
    setTrackingResult((prev) => {
      if (!prev.isReady) return { ...prev, isReady: true }
      return prev
    })

    if (
      !results ||
      !results.multiHandLandmarks ||
      results.multiHandLandmarks.length === 0
    ) {
      setTrackingResult((prev) => {
        if (!prev.isTracking) return prev // Prevent infinite re-renders if already false
        return { ...prev, isTracking: false, wandTip: null, allLandmarks: [] }
      })
      return
    }

    const landmarks = results.multiHandLandmarks[0]
    const handedness =
      (results.multiHandedness?.[0]?.label as "Left" | "Right") ?? null
    const tip = landmarks[LANDMARKS.WAND_TIP]

    if (!tip) return

    setTrackingResult((prev) => ({
      ...prev,
      isTracking: true,
      wandTip: { x: tip.x, y: tip.y, z: tip.z ?? 0 },
      allLandmarks: landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z ?? 0 })),
      handedness,
    }))
  }, [])

  // ─── 2. ENGINE MOUNT / UNMOUNT (Fixes the C++ Abort Crash) ───
  useEffect(() => {
    if (!videoRef.current) return
    let isMounted = true

    // 🪄 The Safety Timer is declared here, perfectly in scope for the cleanup!
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setTrackingResult((prev) =>
          prev.isReady ? prev : { ...prev, isReady: true },
        )
        console.warn(
          "Wand Engine: AI initialization timed out. Forcing UI active.",
        )
      }
    }, 6000)

    // Initialize MediaPipe Hands
    const hands = new HandsUtils.Hands({
      locateFile: (file) => {
        const fileName = file || "hands.binarypb"
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${fileName}`
      },
    })

    hands.setOptions(MEDIAPIPE_CONFIG)
    hands.onResults(onResults)
    handsRef.current = hands

    // Initialize Camera
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768
    const camera = new CameraUtils.Camera(videoRef.current, {
      onFrame: async () => {
        if (!isMounted || !videoRef.current || !handsRef.current) return
        try {
          await handsRef.current.send({ image: videoRef.current })
        } catch (e) {
          // Silently catch frame skips while the AI boots up
        }
      },
      width: isMobile ? 480 : 1280,
      height: isMobile ? 640 : 720,
    })

    camera.start().catch((err) => console.error("Camera start error:", err))
    cameraRef.current = camera

    // ─── CLEANUP (Kills the engine cleanly on Fast Refresh) ───
    return () => {
      isMounted = false
      clearTimeout(safetyTimer) // 👈 No more "Cannot find name" error!
      if (cameraRef.current) {
        cameraRef.current.stop()
      }
      if (handsRef.current) {
        handsRef.current.close()
      }
    }
  }, [videoRef, onResults])

  return trackingResult
}
