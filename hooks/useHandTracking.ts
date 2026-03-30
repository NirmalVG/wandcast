"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import HandsUtils from "@mediapipe/hands"
import type { Results } from "@mediapipe/hands"
import {
  MEDIAPIPE_CONFIG,
  LANDMARKS,
} from "@/lib/mediapipe/config"
import type { HandTrackingResult } from "@/types"

// ─── Acquire camera stream with flexible constraints + retry ─────────────────
async function acquireStream(): Promise<MediaStream> {
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad/i.test(navigator.userAgent)

  // First attempt: ideal resolution, facingMode preference
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: isMobile ? 480 : 1280 },
        height: { ideal: isMobile ? 640 : 720 },
      },
      audio: false,
    })
  } catch (firstErr) {
    console.warn("Camera first attempt failed, retrying with loose constraints:", firstErr)
  }

  // Second attempt: just ask for any front camera
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    })
  } catch (secondErr) {
    console.warn("Camera second attempt failed, trying bare minimum:", secondErr)
  }

  // Last resort: no constraints at all
  return await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  })
}

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const handsRef = useRef<InstanceType<typeof HandsUtils.Hands> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const sendingRef = useRef(false)

  const [trackingResult, setTrackingResult] = useState<HandTrackingResult>({
    isReady: false,
    isTracking: false,
    wandTip: null,
    allLandmarks: [],
    handedness: null,
  })

  // ─── 1. OPTIMIZED RESULTS HANDLER ───
  const onResults = useCallback((results: Results) => {
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
        if (!prev.isTracking) return prev
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

  // ─── 2. ENGINE MOUNT / UNMOUNT ───
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let isMounted = true

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

    // ─── Frame loop: send video frames to MediaPipe ───
    const frameLoop = () => {
      if (!isMounted || !video || !handsRef.current) return

      // Only send if previous frame finished processing
      if (!sendingRef.current && video.readyState >= 2) {
        sendingRef.current = true
        handsRef.current
          .send({ image: video })
          .catch(() => {
            // Silently catch frame skips while the AI boots up
          })
          .finally(() => {
            sendingRef.current = false
          })
      }

      rafRef.current = requestAnimationFrame(frameLoop)
    }

    // ─── Acquire camera + start ───
    acquireStream()
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        video.srcObject = stream
        video.play().catch(() => {
          // Autoplay blocked — user interaction needed
        })

        // Start the frame loop once video is actually playing
        const startLoop = () => {
          if (isMounted) {
            rafRef.current = requestAnimationFrame(frameLoop)
          }
        }

        if (video.readyState >= 2) {
          startLoop()
        } else {
          video.addEventListener("loadeddata", startLoop, { once: true })
        }
      })
      .catch((err) => {
        console.error("Failed to acquire camera feed:", err)
      })

    // ─── Pause when tab hidden — saves battery ───
    const handleVisibility = () => {
      if (!isMounted) return
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
      } else if (streamRef.current) {
        rafRef.current = requestAnimationFrame(frameLoop)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    // ─── CLEANUP ───
    return () => {
      isMounted = false
      document.removeEventListener("visibilitychange", handleVisibility)
      cancelAnimationFrame(rafRef.current)

      // Stop all camera tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      // Clear video src
      if (video) {
        video.srcObject = null
      }

      // Close MediaPipe
      if (handsRef.current) {
        handsRef.current.close()
        handsRef.current = null
      }
    }
  }, [videoRef, onResults])

  return trackingResult
}
