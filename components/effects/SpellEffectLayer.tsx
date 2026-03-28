"use client"

import AccioEffect from "./AccioEffect"
import ExpelliarmusEffect from "./ExpelliarmusEffect"
import LumosEffect from "./LumosEffect"
import NoxEffect from "./NoxEffect"
import PatronumEffect from "./PatronumEffect"
import ProtegoEffect from "./ProtegoEffect"
import StupefyEffect from "./StupefyEffect"
import WingardiumEffect from "./WingardiumEffect"
import type { ActiveEffect } from "@/types"

interface Props {
  activeEffect: ActiveEffect | null
  canvasWidth: number
  canvasHeight: number
  onComplete: () => void
}

const effectRegistry = {
  lumos: LumosEffect,
  nox: NoxEffect,
  accio: AccioEffect,
  expelliarmus: ExpelliarmusEffect,
  stupefy: StupefyEffect,
  protego: ProtegoEffect,
  wingardium: WingardiumEffect,
  patronum: PatronumEffect,
} as const

export default function SpellEffectLayer({
  activeEffect,
  canvasWidth,
  canvasHeight,
  onComplete,
}: Props) {
  if (!activeEffect) return null

  const EffectComponent = effectRegistry[activeEffect.spell]

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <EffectComponent
        key={activeEffect.id}
        wandTip={activeEffect.wandTip}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onComplete={onComplete}
      />
    </div>
  )
}
