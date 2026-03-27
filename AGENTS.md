<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# AGENTS.md — WandCast

> This file is the single source of truth for any AI agent (Claude, Cursor, GitHub Copilot, Gemini, etc.)
> working on the WandCast codebase. Read this fully before writing or suggesting any code.

---

## 🪄 What Is WandCast?

WandCast is a **Harry Potter-themed AR web app** where users wave their phone like a wand and cast
real spells with jaw-dropping particle effects — powered entirely in the browser.

- **No backend GPU** — all computer vision runs client-side via MediaPipe
- **Zero cost** — Vercel free tier, MongoDB Atlas M0, all OSS libraries
- **Portfolio-grade** — built to impress, designed to go viral

**Live URL:** `wandcast.vercel.app`
**Repo:** `github.com/[username]/wandcast`
**Tagline:** _Cast spells with your phone_

---

## 🏗️ Tech Stack

| Layer          | Technology              | Version         | Notes                             |
| -------------- | ----------------------- | --------------- | --------------------------------- |
| Framework      | Next.js                 | 16 (App Router) | Turbopack enabled                 |
| Language       | TypeScript              | 5               | Strict mode                       |
| Styling        | Tailwind CSS            | v4              | NO config file — CSS-only setup   |
| Hand Tracking  | MediaPipe Hands         | latest          | Client-side only                  |
| Camera Utils   | @mediapipe/camera_utils | latest          | Default import — see import rules |
| 3D / Particles | Three.js                | latest          | Raw + @react-three/fiber          |
| R3F            | @react-three/fiber      | latest          | React wrapper for Three.js        |
| Drei           | @react-three/drei       | latest          | Three.js helpers                  |
| Animation      | Framer Motion           | 11              | UI transitions only               |
| State          | Zustand                 | 4               | Global wand + game state          |
| Database       | MongoDB Atlas           | M0 Free         | Optional cloud sync               |
| Hosting        | Vercel                  | Free Tier       | Auto HTTPS — required for camera  |

---

## 📁 Project Structure

```
wandcast/
├── app/
│   ├── globals.css              # Tailwind v4 — @import "tailwindcss" ONLY
│   ├── layout.tsx               # Root layout, fonts
│   └── page.tsx                 # Entry — renders <CameraView />
│
├── components/
│   ├── camera/
│   │   ├── CameraView.tsx       # Camera container — owns useHandTracking instance
│   │   └── HandOverlay.tsx      # Canvas: skeleton lines + golden wand tip dot
│   ├── effects/                 # Three.js spell particle effects (Phase 2)
│   │   ├── LumosEffect.tsx
│   │   ├── NoxEffect.tsx
│   │   ├── AccioEffect.tsx
│   │   ├── ExpelliarmusEffect.tsx
│   │   ├── StupefyEffect.tsx
│   │   ├── ProtegoEffect.tsx
│   │   ├── WingardiumEffect.tsx
│   │   └── PatronumEffect.tsx
│   ├── ui/                      # Harry Potter themed UI components (Phase 3)
│   │   ├── SpellHUD.tsx
│   │   ├── SpellBook.tsx
│   │   ├── HouseSelector.tsx
│   │   └── ConfidenceMeter.tsx
│   └── modes/                   # Game mode screens (Phase 4)
│       ├── PracticeMode.tsx
│       └── ChallengeMode.tsx
│
├── hooks/
│   ├── useHandTracking.ts       # ✅ DONE — MediaPipe init + onResults + cleanup
│   ├── useWandTrail.ts          # Phase 2 — 30-frame trajectory ring buffer
│   ├── useSpellRecognition.ts   # Phase 2 — DTW matching against templates
│   └── useSpellEffects.ts       # Phase 2 — mounts/unmounts Three.js effects
│
├── lib/
│   ├── mediapipe/
│   │   └── config.ts            # ✅ DONE — MEDIAPIPE_CONFIG, CAMERA_CONFIG, LANDMARKS
│   ├── gesture/
│   │   ├── dtw.ts               # Phase 2 — Dynamic Time Warping algorithm
│   │   └── normalize.ts         # Phase 2 — center, scale, rotate trajectory
│   └── spells/
│       └── templates.ts         # Phase 2 — 8 spell gesture templates
│
├── store/
│   └── wandStore.ts             # Zustand store — WandStore interface
│
├── types/
│   └── index.ts                 # ✅ DONE — ALL shared types live here, nowhere else
│
└── spells/                      # JSON spell definitions (Phase 2)
    ├── lumos.json
    ├── nox.json
    ├── accio.json
    ├── expelliarmus.json
    ├── stupefy.json
    ├── protego.json
    ├── wingardium.json
    └── patronum.json
```

---

## 🔑 MediaPipe Import Rules — CRITICAL

MediaPipe packages use **CommonJS exports**, not ES module named exports.
Getting this wrong causes: `Export X doesn't exist in target module`.

### `@mediapipe/hands`

```ts
// ✅ CORRECT
import { Hands } from "@mediapipe/hands"
import type { Results } from "@mediapipe/hands" // type-only import

// ❌ WRONG — Results is a type, not a runtime value
import { Hands, Results } from "@mediapipe/hands"
```

### `@mediapipe/camera_utils`

```ts
// ✅ CORRECT — default import, access Camera via dot notation
import CameraUtils from '@mediapipe/camera_utils';
const camera = new CameraUtils.Camera(videoRef.current, { ... });

// ❌ WRONG — named import doesn't exist in this package
import { Camera } from '@mediapipe/camera_utils';
```

### `@mediapipe/drawing_utils`

```ts
// ✅ CORRECT
import DrawingUtils from '@mediapipe/drawing_utils';
DrawingUtils.drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { ... });

// ❌ WRONG
import { drawConnectors } from '@mediapipe/drawing_utils';
```

### Ref types for MediaPipe classes

```ts
// ✅ CORRECT — use InstanceType<typeof X>
const handsRef = useRef<InstanceType<typeof Hands> | null>(null)
const cameraRef = useRef<InstanceType<typeof CameraUtils.Camera> | null>(null)

// ❌ WRONG — Hands is not a valid ref generic directly
const handsRef = useRef<Hands | null>(null)
```

---

## 📐 Types — `types/index.ts` (Complete & Canonical)

**Every shared type lives here and ONLY here.**
Never define `WandPoint`, `SpellName`, or any shared interface locally in a hook or component.
Doing so causes: `Import declaration conflicts with local declaration of 'X'.ts(2440)`

```ts
// ─── HAND TRACKING ───────────────────────────────────────────

export interface WandPoint {
  x: number // 0.0 to 1.0 normalized
  y: number // 0.0 to 1.0 normalized
  z: number // depth estimate (less reliable than x/y)
}

export interface HandTrackingResult {
  isTracking: boolean
  wandTip: WandPoint | null
  allLandmarks: WandPoint[]
  handedness: "Left" | "Right" | null
}

// ─── SPELLS ──────────────────────────────────────────────────

export type SpellName =
  | "lumos"
  | "nox"
  | "accio"
  | "expelliarmus"
  | "stupefy"
  | "protego"
  | "wingardium"
  | "patronum"

export interface SpellMatch {
  spell: SpellName | null
  confidence: number // 0.0 to 1.0
  castAt: number // Date.now() timestamp
}

export interface SpellDefinition {
  name: SpellName
  displayName: string
  color: string // hex — used for particle effect color
  gesture: string // human-readable gesture hint
  unlocked: boolean
}

// ─── GAME ────────────────────────────────────────────────────

export type GameMode = "idle" | "practice" | "challenge"

// ─── STORE ───────────────────────────────────────────────────

export interface WandStore {
  isTracking: boolean
  wandTip: WandPoint | null
  currentSpell: SpellName | null
  spellConfidence: number
  lastCastAt: number | null
  gameMode: GameMode
  score: number
  unlockedSpells: SpellName[]

  // Actions
  setTracking: (isTracking: boolean, tip: WandPoint | null) => void
  castSpell: (spell: SpellName, confidence: number) => void
  setGameMode: (mode: GameMode) => void
  unlockSpell: (spell: SpellName) => void
}
```

---

## 🔢 Landmark Constants — `lib/mediapipe/config.ts` (Complete & Canonical)

```ts
const isMobile =
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad/i.test(navigator.userAgent)

export const MEDIAPIPE_CONFIG = {
  maxNumHands: 1,
  modelComplexity: isMobile ? 0 : 1, // 0 = Lite (faster), 1 = Full (accurate)
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
} as const

export const CAMERA_CONFIG = {
  width: 1280,
  height: 720,
} as const

// Named landmark indices — NEVER use raw numbers like landmarks[8]
export const LANDMARKS = {
  WRIST: 0,
  THUMB_TIP: 4,
  WAND_TIP: 8, // index finger tip — primary tracking point
  MIDDLE_TIP: 12,
  RING_TIP: 16,
  PINKY_TIP: 20,
} as const
```

### Landmark Map

```
        8  ← WAND_TIP (index fingertip)
        |
        7
        |
        6
        |
   5 ───┴─── (index knuckle)
   |
WRIST (0)
```

---

## 🪝 `hooks/useHandTracking.ts` (Complete & Canonical)

```ts
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

  // Runs 30x/sec — useCallback prevents recreation every render
  const onResults = useCallback((results: Results) => {
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

    const landmarks = results.multiHandLandmarks[0]
    const handedness =
      (results.multiHandedness?.[0]?.label as "Left" | "Right") ?? null

    const tip = landmarks[LANDMARKS.WAND_TIP]
    const wandTip: WandPoint = { x: tip.x, y: tip.y, z: tip.z }
    const allLandmarks: WandPoint[] = landmarks.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
    }))

    setTrackingResult({ isTracking: true, wandTip, allLandmarks, handedness })
  }, [])

  useEffect(() => {
    if (!videoRef.current) return

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })
    hands.setOptions(MEDIAPIPE_CONFIG)
    hands.onResults(onResults)
    handsRef.current = hands

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

    // Pause when tab hidden — saves battery on mobile
    const handleVisibility = () => {
      if (document.hidden) {
        camera.stop()
      } else {
        camera.start()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      camera.stop()
      hands.close()
    }
  }, [videoRef, onResults])

  return trackingResult
}
```

---

## 🎨 Styling Rules — Tailwind v4

### The only correct import

```css
/* app/globals.css */
@import "tailwindcss";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}
```

### Custom theme tokens (add in Phase 3)

```css
@theme {
  --color-parchment: #f5e6c8;
  --color-gold: #f0b429;
  --color-wand-glow: #ffd700;
  --color-spell-blue: #64c8ff;
  --color-crimson: #8b0000;
  --color-emerald: #1a4a2e;
}
```

### Rules

```
✅ @import "tailwindcss"              — v4 syntax, one line replaces all three
❌ @tailwind base                     — v3 syntax, DO NOT USE
❌ @tailwind components               — v3 syntax, DO NOT USE
❌ @tailwind utilities                — v3 syntax, DO NOT USE
❌ tailwind.config.js                 — not needed in v4, DO NOT CREATE
```

### Fonts

```
Cinzel        → headings, spell names, HP titles
Crimson Text  → body text, descriptions, parchment copy
Fira Code     → debug HUD, coordinates, monospace UI elements
```

---

## 🏛️ Architecture Rules

### 1. One MediaPipe instance — in CameraView only

```
page.tsx
  └── CameraView.tsx
        ├── useHandTracking()      ← initialized ONCE here
        ├── HandOverlay.tsx        ← receives trackingResult as prop
        └── SpellHUD.tsx           ← receives trackingResult as prop
```

### 2. Hooks own logic — Components own UI

```
hooks/      → pure TypeScript logic, no JSX, no Tailwind
components/ → JSX + Tailwind classes, minimal logic
lib/        → pure functions + constants, no React
store/      → Zustand state only
types/      → TypeScript interfaces only
```

### 3. Always mirror both video AND canvas

```tsx
// ✅ CORRECT — both elements mirrored
<video style={{ transform: 'scaleX(-1)' }} />
<canvas style={{ transform: 'scaleX(-1)' }} />

// ❌ WRONG — skeleton will appear on wrong side of screen
<video style={{ transform: 'scaleX(-1)' }} />
<canvas />
```

### 4. Three.js effects are isolated (Phase 2)

Each spell = its own component in `components/effects/`.
Mounted/unmounted based on `currentSpell` in Zustand store.
Never reads from MediaPipe directly.

### 5. Spell cast threshold

```ts
// lib/gesture/dtw.ts
export const CAST_THRESHOLD = 0.7 // never cast below 70% confidence
```

---

## ⚡ Performance Rules (Non-Negotiable)

| Rule                                  | Reason                                             |
| ------------------------------------- | -------------------------------------------------- |
| `useCallback` on `onResults`          | Runs 30×/sec — must not recreate on every render   |
| `useRef` for video element            | Direct DOM access without re-renders               |
| `canvas.clearRect()` every frame      | Prevents ghost trails from previous frame          |
| Max 100 particles per effect          | Beyond this, mobile FPS drops below 20             |
| Object pooling for Three.js           | Never `new THREE.Vector3()` inside animation loops |
| Web Worker for DTW (Phase 2)          | DTW on 30-frame arrays is CPU-heavy — offload it   |
| `modelComplexity: 0` on mobile        | Auto-detected in config.ts via navigator.userAgent |
| `visibilitychange` listener           | Stop camera when tab hidden — saves battery        |
| Guard `handsRef.current` in `onFrame` | Prevents crash if component unmounts mid-frame     |

---

## 🌐 Camera & HTTPS

Camera API is **blocked on HTTP**. Test on:

```
✅ Vercel preview URL    — auto HTTPS, works on phone
✅ localhost             — fine for desktop Chrome only
❌ 192.168.x.x           — HTTP, camera blocked on phone
❌ http://               — always blocked regardless of device
```

---

## 🐛 Known Bugs & Fixes (Running Log)

| Error                                                                         | Cause                                            | Fix                                                                                 |
| ----------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `Export Camera doesn't exist in target module`                                | Named import from CommonJS package               | `import CameraUtils from '@mediapipe/camera_utils'` → `new CameraUtils.Camera(...)` |
| `Import declaration conflicts with local declaration of 'WandPoint'`          | Type defined locally AND imported from `@/types` | Remove local definition, import from `@/types` only                                 |
| Camera black on phone                                                         | Testing via HTTP local IP                        | Use Vercel HTTPS URL on mobile                                                      |
| Skeleton offset from video                                                    | Only one of video/canvas is mirrored             | Apply `scaleX(-1)` to **both**                                                      |
| `Export Hands doesn't exist in target module`                                 | Named import from CommonJS package               |
| Use `import HandsUtils from '@mediapipe/hands'` → `new HandsUtils.Hands(...)` |

---

## 🗓️ Build Phases & Current Status

| Phase               | Weeks | Status         | Focus                                         |
| ------------------- | ----- | -------------- | --------------------------------------------- |
| 1 — Foundation      | 1–3   | 🔨 In Progress | Camera + MediaPipe + DTW + Lumos              |
| 2 — Effects & Audio | 4–7   | ⏳ Pending     | Three.js particles + all 8 spells + Web Audio |
| 3 — Polish          | 8–10  | ⏳ Pending     | HP theme + mobile optimization + PWA          |
| 4 — Launch          | 11–12 | ⏳ Pending     | Challenge mode + CI/CD + Product Hunt         |

### Completed Files

```
✅ app/globals.css
✅ app/page.tsx
✅ lib/mediapipe/config.ts
✅ types/index.ts
✅ hooks/useHandTracking.ts
✅ components/camera/HandOverlay.tsx
✅ components/camera/CameraView.tsx
```

### In Progress

```
🔨 Lesson 2 — verifying hand skeleton live on phone
⏳ Lesson 3 — wand trail (30-frame ring buffer)
⏳ Lesson 4 — DTW spell recognition + Lumos
```

---

## 🚫 Never Do

```
❌ @tailwind base / components / utilities        — v3 syntax, breaks in v4
❌ Create tailwind.config.js                      — not needed in v4
❌ import { Camera } from '@mediapipe/camera_utils' — named import breaks
❌ import { drawConnectors } from '@mediapipe/drawing_utils' — same issue
❌ Define WandPoint or any shared type locally    — use @/types only
❌ Initialize MediaPipe in a component            — use useHandTracking only
❌ Use magic numbers: landmarks[8]               — use LANDMARKS.WAND_TIP
❌ new THREE.Vector3() inside animation loop     — causes GC spikes
❌ Mirror only video or only canvas              — always mirror both
❌ Test camera on phone via local IP (HTTP)
❌ Cast spell below CAST_THRESHOLD (0.70)
❌ Add more than 8 spells before v1.0 launch
```

## ✅ Always Do

```
✅ @import "tailwindcss"                          — one line, v4 syntax
✅ import CameraUtils from '@mediapipe/camera_utils'
✅ import type { Results } from '@mediapipe/hands' — type-only import
✅ All types imported from @/types               — single source of truth
✅ useCallback on onResults                       — runs 30x/sec
✅ useRef for video element                       — no re-render on frame
✅ Mirror both <video> and <canvas> with scaleX(-1)
✅ Guard handsRef.current before sending frames
✅ visibilitychange listener to pause on tab hide
✅ clearRect() at start of every canvas draw call
✅ Test on phone via Vercel HTTPS URL
✅ modelComplexity: 0 on mobile (auto-detected in config)
```

---

## 👤 Developer Context

| Field          | Detail                                              |
| -------------- | --------------------------------------------------- |
| Developer      | Nirmal                                              |
| OS             | Windows — PowerShell commands only                  |
| Experience     | ~2 years Next.js / React                            |
| MediaPipe      | Used before in Ishaara project                      |
| Three.js       | Zero prior experience — teach from scratch          |
| Teaching style | Concept → Why → Code → What to see → Next step      |
| Goal           | Portfolio-grade, viral, GitHub stars, resume bullet |

---

_Last updated: March 26, 2026 — Phase 1, Lesson 2 in progress_
_Next: Lesson 3 — Wand Trail (30-frame ring buffer)_

<!-- END:nextjs-agent-rules -->
