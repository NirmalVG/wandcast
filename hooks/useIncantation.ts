"use client"
import { useState, useEffect, useCallback } from "react"
import type { SpellName } from "@/types"

// The browser will mishear Latin spells. We catch the common mistakes here.
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

  // Auto-clear the detected spell after 2 seconds
  useEffect(() => {
    if (detectedSpell) {
      const timer = setTimeout(() => setDetectedSpell(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [detectedSpell])

  const toggleListening = useCallback(() => {
    if (typeof window === "undefined") return

    // Cross-browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Your browser does not support voice spells. Try Chrome.")
      return
    }

    if (isListening) {
      setIsListening(false)
      return // The recognition.onend event will handle stopping
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true // Keep listening
    recognition.interimResults = true // Show words as they are spoken
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: any) => {
      // Get the most recent phrase spoken
      const current = event.resultIndex
      const text = event.results[current][0].transcript.toLowerCase().trim()
      setTranscript(text)

      // Check if the text contains any of our spells or fuzzy matches
      for (const [spell, aliases] of Object.entries(SPELL_DICTIONARY)) {
        if (aliases.some((alias) => text.includes(alias))) {
          setDetectedSpell(spell as SpellName)
          setTranscript(`✨ ${spell.toUpperCase()} ✨`)
          break // Stop searching once a spell is found
        }
      }
    }

    recognition.onerror = (event: any) => {
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
