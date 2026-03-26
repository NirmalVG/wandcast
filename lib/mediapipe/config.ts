export const MEDIAPIPE_CONFIG = {
  maxNumHands: 1,
  modelComplexity: 1, // 0 = faster (mobile), 1 = accurate (desktop)
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
} as const

export const CAMERA_CONFIG = {
  width: 1280,
  height: 720,
} as const

// Landmark indices — named so we never use magic numbers
export const LANDMARKS = {
  WRIST: 0,
  WAND_TIP: 8, // index finger tip
  MIDDLE_TIP: 12,
  RING_TIP: 16,
  PINKY_TIP: 20,
  THUMB_TIP: 4,
} as const
