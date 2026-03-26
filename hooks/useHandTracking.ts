"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Hands, Results } from "@mediapipe/hands"
import { Camera } from "@mediapipe/camera_utils"
import {
  MEDIAPIPE_CONFIG,
  CAMERA_CONFIG,
  LANDMARKS,
} from "@/lib/mediapipe/config"

// This is the shape of data we expose to the rest of the app
export interface WandPoint {
  x: number // 0 to 1 (normalized)
  y: number // 0 to 1 (normalized)
  z: number // depth estimate
}

export interface HandTrackingResult {
  isTracking: boolean // is a hand visible?
  wandTip: WandPoint | null // index finger tip position
  allLandmarks: WandPoint[] // all 21 points (for drawing skeleton)
  handedness: "Left" | "Right" | null
}

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement>) {
  const handsRef = useRef<Hands | null>(null)
  const cameraRef = useRef<Camera | null>(null)

  const [trackingResult, setTrackingResult] = useState<HandTrackingResult>({
    isTracking: false,
    wandTip: null,
    allLandmarks: [],
    handedness: null,
  })

  // This runs every frame — keep it fast!
  const onResults = useCallback((results: Results) => {
    if (
      !results.multiHandLandmarks ||
      results.multiHandLandmarks.length === 0
    ) {
      // No hand detected
      setTrackingResult({
        isTracking: false,
        wandTip: null,
        allLandmarks: [],
        handedness: null,
      })
      return
    }

    // Take the first hand only (maxNumHands: 1)
    const landmarks = results.multiHandLandmarks[0]
    const handedness = results.multiHandedness?.[0]?.label as "Left" | "Right"
    const tip = landmarks[LANDMARKS.WAND_TIP]

    setTrackingResult({
      isTracking: true,
      wandTip: { x: tip.x, y: tip.y, z: tip.z },
      allLandmarks: landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z })),
      handedness,
    })
  }, [])

  useEffect(() => {
    if (!videoRef.current) return

    // Initialize MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    hands.setOptions(MEDIAPIPE_CONFIG)
    hands.onResults(onResults)
    handsRef.current = hands

    // Initialize Camera util — feeds video frames to MediaPipe
    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current })
        }
      },
      width: CAMERA_CONFIG.width,
      height: CAMERA_CONFIG.height,
    })

    camera.start()
    cameraRef.current = camera

    // Cleanup when component unmounts
    return () => {
      camera.stop()
      hands.close()
    }
  }, [videoRef, onResults])

  return trackingResult
}
