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
    isTracking: false,
    wandTip: null,
    allLandmarks: [],
    handedness: null,
  })

  // ─── FRAME CALLBACK ──────────────────────────────────────────────────────────
  // Runs 30x per second — useCallback keeps reference stable, prevents re-registration
  const onResults = useCallback((results: Results) => {
    // Guard 1 — results itself could be malformed
    if (!results) return

    // Guard 2 — no hand landmarks in this frame
    if (
      !results.multiHandLandmarks ||
      results.multiHandLandmarks.length === 0
    ) {
      setTrackingResult({
        isTracking: false,
        wandTip: null,
        allLandmarks: [],
        handedness: null,
      })
      return
    }

    // First hand only (maxNumHands: 1)
    const landmarks = results.multiHandLandmarks[0]

    // Guard 3 — landmarks array itself could be empty
    if (!landmarks || landmarks.length === 0) {
      setTrackingResult({
        isTracking: false,
        wandTip: null,
        allLandmarks: [],
        handedness: null,
      })
      return
    }

    const handedness =
      (results.multiHandedness?.[0]?.label as "Left" | "Right") ?? null

    // Landmark 8 = index finger tip = wand tip 🪄
    const tip = landmarks[LANDMARKS.WAND_TIP]

    // Guard 4 — wand tip landmark could be missing
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
      isTracking: true,
      wandTip,
      allLandmarks,
      handedness,
    })
  }, []) // empty deps — pure function, stable forever

  // ─── MEDIAPIPE INIT ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoRef.current) return

    // 1. Initialize MediaPipe Hands model
    const hands = new HandsUtils.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    hands.setOptions(MEDIAPIPE_CONFIG)
    hands.onResults(onResults)
    handsRef.current = hands

    // 2. Initialize Camera — feeds each video frame into MediaPipe
    const camera = new CameraUtils.Camera(videoRef.current, {
      onFrame: async () => {
        // Guard — component may unmount between frames
        if (videoRef.current && handsRef.current) {
          await handsRef.current.send({ image: videoRef.current })
        }
      },
      width: CAMERA_CONFIG.width,
      height: CAMERA_CONFIG.height,
    })

    camera.start()
    cameraRef.current = camera

    // 3. Pause when tab is hidden — saves mobile battery
    const handleVisibility = () => {
      if (document.hidden) {
        camera.stop()
      } else {
        camera.start()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    // 4. Full cleanup on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      camera.stop()
      hands.close()
    }
  }, [videoRef, onResults])

  return trackingResult
}
