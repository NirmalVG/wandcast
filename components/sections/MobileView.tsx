"use client"
import { motion } from "framer-motion"
import { Sun, Moon, Zap, Shield, Wind, Sparkle, Camera } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function MobileView() {
  const [activeSpell, setActiveSpell] = useState(0)

  const spells = [
    { icon: Sun, name: "Lumos", desc: "Incandescence" },
    { icon: Moon, name: "Nox", desc: "Extinguish" },
    { icon: Zap, name: "Expelliarmus", desc: "Disarm" },
    { icon: Shield, name: "Protego", desc: "Form Shield" },
    { icon: Wind, name: "Accio", desc: "Summon" },
    { icon: Sparkle, name: "Patronum", desc: "Guardian" },
  ]

  return (
    <div className="md:hidden flex flex-col min-h-screen relative z-20">
      {/* Mobile Hero */}
      <section className="flex flex-col items-center justify-center flex-1 py-12 px-6 text-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="font-cinzel text-[2.5rem] font-black text-gold-b mb-12 drop-shadow-[0_0_40px_rgba(240,180,41,0.5)]"
        >
          W
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="font-cinzel text-[clamp(3rem,14vw,5rem)] font-black text-ink leading-none mb-3"
        >
          WandCast
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="font-crimson italic text-[1.15rem] text-gold-pale mb-12"
        >
          Master the Art of Wandless Magic.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-gold-dim text-lg rotate-90 animate-bounce"
        >
          ❯❯
        </motion.div>
      </section>

      {/* Mobile Spells Scroll */}
      <section className="w-full pt-4">
        <div className="flex gap-3 px-6 pb-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {spells.map((spell, idx) => {
            const Icon = spell.icon
            const isActive = activeSpell === idx
            return (
              <div
                key={idx}
                onClick={() => setActiveSpell(idx)}
                className={`flex-shrink-0 w-[170px] snap-start bg-[#1e1810]/95 border ${isActive ? "border-border-b" : "border-border-dim"} rounded-[3px] p-6 text-center transition-all active:scale-[0.97]`}
              >
                <div className="w-16 h-16 bg-gold/10 rounded-xl flex items-center justify-center text-gold-b mx-auto mb-4 text-2xl">
                  <Icon />
                </div>
                <div className="font-cinzel text-[0.75rem] font-bold tracking-[0.15em] text-gold-pale uppercase mb-1">
                  {spell.name}
                </div>
                <div className="font-crimson italic text-[0.85rem] text-ink-dim">
                  {spell.desc}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Mobile CTA */}
      <section className="flex flex-col px-6 py-8 gap-4">
        <Link
          href="/camera"
          className="w-full font-cinzel text-[0.75rem] font-bold tracking-[0.25em] text-bg-dark bg-gold-b py-[1.1rem] rounded-[2px] active:scale-[0.98] transition-transform"
        >
          READY YOUR WAND
        </Link>
        <div className="font-fira text-[0.65rem] text-ink-faint tracking-[0.1em] flex items-center justify-center gap-1.5">
          <Camera size={14} /> [ REQUIRES CAMERA ACCESS ]
        </div>
      </section>
    </div>
  )
}
