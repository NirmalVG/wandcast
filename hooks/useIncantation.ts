"use client"

import { useCallback, useEffect, useState } from "react"
import type { SpellName } from "@/types"

interface SpeechRecognitionAlternative {
  transcript: string
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternative
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: SpeechRecognitionResultLike[]
}

interface SpeechRecognitionErrorEventLike {
  error: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
}

interface BrowserSpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance
}

const SPELL_DICTIONARY: Record<SpellName, string[]> = {
  lumos: ["lumos", "loomis", "lumens", "blue moss", "lou most", "loumos"],
  nox: ["nox", "knocks", "locks", "box", "max", "rocks"],
  accio: ["accio", "axio", "action", "akio", "a key oh", "ikio"],
  expelliarmus: [
    "expelliarmus",
    "expel your arms",
    "spell your arm",
    "expelly",
    "excel arms",
  ],
  stupefy: ["stupefy", "stupidify", "stupa fly", "snoopy pie", "stupid by"],
  protego: ["protego", "protect go", "pro tay go", "potato", "portago"],
  wingardium: ["wingardium", "wing guardian", "when guardian", "win garden"],
  patronum: ["patronum", "patronus", "petronum", "petroleum"],
}

export function useIncantation() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [detectedSpell, setDetectedSpell] = useState<SpellName | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!detectedSpell) return

    const timer = window.setTimeout(() => setDetectedSpell(null), 2000)
    return () => window.clearTimeout(timer)
  }, [detectedSpell])

  const toggleListening = useCallback(() => {
    if (typeof window === "undefined") return

    const speechWindow = window as BrowserSpeechWindow
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Your browser does not support voice spells. Try Chrome.")
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const current = event.resultIndex
      const text = event.results[current][0].transcript.toLowerCase().trim()
      setTranscript(text)

      for (const [spell, aliases] of Object.entries(SPELL_DICTIONARY)) {
        if (aliases.some((alias) => text.includes(alias))) {
          setDetectedSpell(spell as SpellName)
          setTranscript(`Spell detected: ${spell.toUpperCase()}`)
          break
        }
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === "not-allowed") {
        setError("Microphone access denied by the Ministry of Magic.")
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [isListening])

  return { isListening, transcript, detectedSpell, error, toggleListening }
}
