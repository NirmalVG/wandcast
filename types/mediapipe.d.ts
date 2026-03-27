// Declaration file for MediaPipe packages.
// These packages ship CommonJS without full .d.ts coverage.
// This file tells TypeScript what to expect.

declare module "@mediapipe/hands" {
  export interface NormalizedLandmark {
    x: number
    y: number
    z: number
    visibility?: number
  }

  export interface Results {
    multiHandLandmarks: NormalizedLandmark[][]
    multiHandedness: Array<{
      label: string
      score: number
      index: number
    }>
    image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  }

  export interface HandsConfig {
    locateFile?: (path: string) => string
  }

  export interface HandsOptions {
    maxNumHands?: number
    modelComplexity?: 0 | 1
    minDetectionConfidence?: number
    minTrackingConfidence?: number
  }

  export class Hands {
    constructor(config?: HandsConfig)
    setOptions(options: HandsOptions): void
    onResults(callback: (results: Results) => void): void
    send(inputs: {
      image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
    }): Promise<void>
    close(): void
  }

  const HandsUtils: {
    Hands: typeof Hands
    HAND_CONNECTIONS: Array<[number, number]>
  }

  export default HandsUtils
}

declare module "@mediapipe/camera_utils" {
  export interface CameraOptions {
    onFrame: () => Promise<void>
    width?: number
    height?: number
    facingMode?: "user" | "environment"
  }

  export class Camera {
    constructor(videoElement: HTMLVideoElement, options: CameraOptions)
    start(): Promise<void>
    stop(): void
  }

  const CameraUtils: {
    Camera: typeof Camera
  }

  export default CameraUtils
}

declare module "@mediapipe/drawing_utils" {
  import type { NormalizedLandmark } from "@mediapipe/hands"

  export interface DrawingOptions {
    color?: string
    lineWidth?: number
    radius?: number
    fillColor?: string
    visibilityMin?: number
  }

  export function drawConnectors(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    connections: Array<[number, number]>,
    options?: DrawingOptions,
  ): void

  export function drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    options?: DrawingOptions,
  ): void

  const DrawingUtils: {
    drawConnectors: typeof drawConnectors
    drawLandmarks: typeof drawLandmarks
  }

  export default DrawingUtils
}
