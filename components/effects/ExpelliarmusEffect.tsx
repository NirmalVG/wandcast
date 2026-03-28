"use client"

import BaseSpellEffect from "./BaseSpellEffect"
import type { WandPoint } from "@/types"

interface Props {
  wandTip: WandPoint
  canvasWidth: number
  canvasHeight: number
  onComplete: () => void
}

export default function ExpelliarmusEffect(props: Props) {
  return <BaseSpellEffect spell="expelliarmus" {...props} />
}
