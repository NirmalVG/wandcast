// Safe mobile detection — typeof guard for SSR (Next.js runs on server too)
const isMobile =
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad/i.test(navigator.userAgent)

export const MEDIAPIPE_CONFIG = {
  maxNumHands: 1,
  modelComplexity: isMobile ? 0 : 1,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.5,
} as const

export const CAMERA_CONFIG = {
  width: isMobile ? 480 : 1280,
  height: isMobile ? 640 : 720,
} as const

// Named landmark indices — NEVER use raw numbers like landmarks[8]
export const LANDMARKS = {
  WRIST: 0,
  THUMB_TIP: 4,
  WAND_TIP: 8, // index finger tip — primary tracking point 🪄
  MIDDLE_TIP: 12,
  RING_TIP: 16,
  PINKY_TIP: 20,
} as const

// Spell recognition
export const CAST_THRESHOLD = 0.7 // minimum confidence to trigger a spell
export const TRAIL_LENGTH = 30 // frames of gesture history to keep
