"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Hands } from "@mediapipe/hands"
import type { Results } from "@mediapipe/hands"
import CameraUtils from "@mediapipe/camera_utils"
import {
  MEDIAPIPE_CONFIG,
  CAMERA_CONFIG,
  LANDMARKS,
} from "@/lib/mediapipe/config"
import type { WandPoint, HandTrackingResult } from "@/types"

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement>) {
  const handsRef = useRef<InstanceType<typeof Hands> | null>(null)
  const cameraRef = useRef<InstanceType<typeof CameraUtils.Camera> | null>(null)

  const [trackingResult, setTrackingResult] = useState<HandTrackingResult>({
    isTracking: false,
    wandTip: null,
    allLandmarks: [],
    handedness: null,
  })

  // ─── FRAME CALLBACK ────────────────────────────────────────
  // Runs 30x per second — must stay fast, no heavy logic here
  const onResults = useCallback((results: Results) => {
    // No hand in frame
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

    // First hand only (maxNumHands: 1 in config)
    const landmarks = results.multiHandLandmarks[0]
    const handedness =
      (results.multiHandedness?.[0]?.label as "Left" | "Right") ?? null

    // Landmark 8 = index finger tip = wand tip
    const tip = landmarks[LANDMARKS.WAND_TIP]

    const wandTip: WandPoint = {
      x: tip.x,
      y: tip.y,
      z: tip.z,
    }

    const allLandmarks: WandPoint[] = landmarks.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
    }))

    setTrackingResult({
      isTracking: true,
      wandTip,
      allLandmarks,
      handedness,
    })
  }, []) // no deps — pure function, never needs to recreate

  // ─── MEDIAPIPE INIT ────────────────────────────────────────
  useEffect(() => {
    if (!videoRef.current) return

    // 1. Initialize Hands model
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    hands.setOptions(MEDIAPIPE_CONFIG)
    hands.onResults(onResults)
    handsRef.current = hands

    // 2. Initialize Camera — feeds video frames to MediaPipe
    const camera = new CameraUtils.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && handsRef.current) {
          await handsRef.current.send({ image: videoRef.current })
        }
      },
      width: CAMERA_CONFIG.width,
      height: CAMERA_CONFIG.height,
    })

    camera.start()
    cameraRef.current = camera

    // 3. Pause tracking when tab is hidden (saves battery)
    const handleVisibility = () => {
      if (document.hidden) {
        camera.stop()
      } else {
        camera.start()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    // 4. Cleanup on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      camera.stop()
      hands.close()
    }
  }, [videoRef, onResults])

  return trackingResult
}
