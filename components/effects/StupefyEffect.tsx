"use client"

import BaseSpellEffect from "./BaseSpellEffect"
import type { WandPoint } from "@/types"

interface Props {
  wandTip: WandPoint
  canvasWidth: number
  canvasHeight: number
  onComplete: () => void
}

export default function StupefyEffect(props: Props) {
  return <BaseSpellEffect spell="stupefy" {...props} />
}
