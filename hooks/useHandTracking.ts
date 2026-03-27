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

// ⚠️ Make sure your types.ts file has `isReady: boolean` added to HandTrackingResult!
export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const handsRef = useRef<InstanceType<typeof HandsUtils.Hands> | null>(null)
  const cameraRef = useRef<InstanceType<typeof CameraUtils.Camera> | null>(null)

  const [trackingResult, setTrackingResult] = useState<
    HandTrackingResult & { isReady: boolean }
  >({
    isReady: false, // <-- This powers your loading screen
    isTracking: false,
    wandTip: null,
    allLandmarks: [],
    handedness: null,
  })

  // ─── FRAME CALLBACK ──────────────────────────────────────────────────────────
  const onResults = useCallback((results: Results) => {
    // If we get empty results, the AI is running, just no hand is visible yet.
    if (
      !results ||
      !results.multiHandLandmarks ||
      results.multiHandLandmarks.length === 0
    ) {
      setTrackingResult((prev) => ({
        ...prev,
        isReady: true, // Tell the UI to hide the loading spinner
        isTracking: false,
        wandTip: null,
        allLandmarks: [],
        handedness: null,
      }))
      return
    }

    // First hand only (maxNumHands: 1)
    const landmarks = results.multiHandLandmarks[0]

    if (!landmarks || landmarks.length === 0) {
      setTrackingResult((prev) => ({
        ...prev,
        isReady: true,
        isTracking: false,
        wandTip: null,
        allLandmarks: [],
        handedness: null,
      }))
      return
    }

    const handedness =
      (results.multiHandedness?.[0]?.label as "Left" | "Right") ?? null

    // Landmark 8 = index finger tip = wand tip 🪄
    const tip = landmarks[LANDMARKS.WAND_TIP]

    if (!tip) return

    const wandTip: WandPoint = {
      x: tip.x ?? 0,
      y: tip.y ?? 0,
      z: tip.z ?? 0,
    }

    const allLandmarks: WandPoint[] = landmarks.map((lm) => ({
      x: lm?.x ?? 0,
      y: lm?.y ?? 0,
      z: lm?.z ?? 0,
    }))

    setTrackingResult({
      isReady: true, // Model is hot and tracking a hand!
      isTracking: true,
      wandTip,
      allLandmarks,
      handedness,
    })
  }, [])

  // ─── MEDIAPIPE INIT ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoRef.current) return

    let isMounted = true // Protects against React Strict Mode double-firing

    // 1. Initialize MediaPipe Hands model
    const hands = new HandsUtils.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    hands.setOptions(MEDIAPIPE_CONFIG)
    hands.onResults(onResults)
    handsRef.current = hands

    // 2. Initialize Camera
    // Crucial Fix: Mobile cameras are portrait, Desktop webcams are landscape.
    // If we don't flip this on mobile, the video gets squished and tracking fails.
    const isMobile = window.innerWidth <= 768
    const reqWidth = isMobile ? CAMERA_CONFIG.height : CAMERA_CONFIG.width
    const reqHeight = isMobile ? CAMERA_CONFIG.width : CAMERA_CONFIG.height

    const camera = new CameraUtils.Camera(videoRef.current, {
      onFrame: async () => {
        // Prevent silent crashes if component unmounted or video isn't ready
        if (!isMounted || !videoRef.current || !handsRef.current) return
        if (videoRef.current.videoWidth === 0) return

        try {
          await handsRef.current.send({ image: videoRef.current })
        } catch (error) {
          console.warn("MediaPipe skipped a frame:", error)
        }
      },
      width: reqWidth,
      height: reqHeight,
    })

    camera.start().catch((err) => console.error("Camera failed:", err))
    cameraRef.current = camera

    // 3. Pause when tab is hidden — saves mobile battery
    const handleVisibility = () => {
      if (document.hidden) {
        camera.stop()
      } else {
        camera.start().catch(console.error)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    // 4. Full cleanup on unmount
    return () => {
      isMounted = false
      document.removeEventListener("visibilitychange", handleVisibility)
      if (cameraRef.current) cameraRef.current.stop()
      if (handsRef.current) handsRef.current.close()
    }
  }, [videoRef, onResults])

  return trackingResult
}
