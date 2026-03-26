"use client"

import { useRef } from "react"
import { useHandTracking } from "@/hooks/useHandTracking"
import HandOverlay from "./HandOverlay"
import { CAMERA_CONFIG } from "@/lib/mediapipe/config"

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(
    null,
  ) as React.RefObject<HTMLVideoElement>
  const trackingResult = useHandTracking(videoRef)

  return (
    <div className="relative w-full h-full">
      {/* Raw camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }} // mirror video too
      />

      {/* Hand skeleton drawn on top */}
      <HandOverlay
        trackingResult={trackingResult}
        width={CAMERA_CONFIG.width}
        height={CAMERA_CONFIG.height}
      />

      {/* Debug HUD — we'll make this beautiful later */}
      <div className="absolute top-4 left-4 font-mono text-xs space-y-1 z-10">
        <div
          className={`px-2 py-1 rounded ${trackingResult.isTracking ? "bg-green-500/80" : "bg-red-500/80"} text-white`}
        >
          {trackingResult.isTracking ? "🪄 Hand Detected" : "✋ No Hand"}
        </div>
        {trackingResult.wandTip && (
          <div className="bg-black/60 text-yellow-300 px-2 py-1 rounded">
            Wand: ({trackingResult.wandTip.x.toFixed(2)},{" "}
            {trackingResult.wandTip.y.toFixed(2)})
          </div>
        )}
        {trackingResult.handedness && (
          <div className="bg-black/60 text-blue-300 px-2 py-1 rounded">
            {trackingResult.handedness} hand
          </div>
        )}
      </div>
    </div>
  )
}
