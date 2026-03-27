// ─── HAND TRACKING ───────────────────────────────────────────────────────────

// Normalized position from MediaPipe (always 0.0 to 1.0)
export interface WandPoint {
  x: number
  y: number
  z: number // depth estimate — less reliable than x/y
}

export interface HandTrackingResult {
  isTracking: boolean
  wandTip: WandPoint | null
  allLandmarks: WandPoint[] // always an array, never undefined
  handedness: "Left" | "Right" | null
}

// ─── SPELLS ──────────────────────────────────────────────────────────────────

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

// ─── GAME ────────────────────────────────────────────────────────────────────

export type GameMode = "idle" | "practice" | "challenge"

// ─── STORE ───────────────────────────────────────────────────────────────────

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
