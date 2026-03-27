"use client"
import { motion, Variants } from "framer-motion"
import VisualizerCanvas from "@/components/ui/VisualizerCanvas"
import { Settings, BookOpen } from "lucide-react"

const reveal: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
}

export default function Features() {
  return (
    <section className="hidden md:grid relative z-10 px-12 pb-24 pt-24 grid-cols-2 gap-[1px] bg-border-dim border-t border-border-dim">
      {/* Visualizer */}
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="col-span-1 bg-bg-dark p-12 relative overflow-hidden transition-colors hover:bg-bg-card"
      >
        <div className="font-fira text-[0.6rem] tracking-[0.2em] text-gold uppercase mb-4">
          THE VISUALIZER
        </div>
        <h2 className="font-cinzel text-[clamp(1.4rem,2.5vw,2.2rem)] font-bold leading-[1.2] text-ink mb-4">
          See your magic manifest
          <br />
          in real-time.
        </h2>
        <div className="mt-6 h-[140px] border border-border-dim relative overflow-hidden">
          <VisualizerCanvas />
        </div>
        <p className="mt-5 text-[0.95rem] leading-[1.7] text-ink-dim max-w-[380px]">
          Every gesture is translated into high-fidelity particle effects using
          custom shaders.
        </p>
      </motion.div>

      {/* Neural Learning */}
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="col-span-1 row-span-2 bg-bg-dark p-12 flex flex-col justify-center transition-colors hover:bg-bg-card"
      >
        <div className="w-[52px] h-[52px] bg-gold/10 border border-border-b flex items-center justify-center text-gold-b mb-6">
          <Settings size={24} />
        </div>
        <h2 className="font-cinzel text-[clamp(1.4rem,2.5vw,2.2rem)] font-bold text-ink mb-4">
          Neural Learning
        </h2>
        <p className="text-[0.95rem] leading-[1.7] text-ink-dim max-w-[380px]">
          Our AI adapts to your unique hand morphology, refining spell accuracy
          with every cast.
        </p>
        <a
          href="#"
          className="font-cinzel text-[0.65rem] tracking-[0.15em] text-gold mt-6 inline-flex items-center gap-1.5 transition-all hover:gap-3 hover:text-gold-b"
        >
          VIEW FORMULAS →
        </a>
      </motion.div>

      {/* Grimoire */}
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="col-span-1 bg-bg-dark p-12 transition-colors hover:bg-bg-card"
      >
        <div className="text-gold-b mb-4">
          <BookOpen size={28} />
        </div>
        <h2 className="font-cinzel text-[1.4rem] font-bold text-ink mb-4">
          The Ancient Grimoire
        </h2>
        <p className="text-[0.9rem] leading-[1.7] text-ink-dim max-w-[380px]">
          Unlock more than 50 legendary spells categorized by elemental affinity
          and complexity.
        </p>
        <div className="mt-6">
          <div className="font-fira text-[0.6rem] text-ink-faint tracking-[0.1em] mb-2">
            LEARNING PROGRESS: 65%
          </div>
          <div className="h-[3px] bg-gold/10 rounded-sm w-[60%] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold-dim to-gold-b w-[65%]" />
          </div>
        </div>
      </motion.div>

      {/* Hardware Free */}
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="col-span-full bg-bg-dark p-12 border-t border-border-dim text-center transition-colors hover:bg-bg-card"
      >
        <h2 className="font-cinzel text-[2rem] font-bold text-ink mb-4">
          Hardware-Free Arcana
        </h2>
        <p className="text-[0.95rem] leading-[1.7] text-ink-dim max-w-[500px] mx-auto">
          No wands, no sensors, no clutter. Your browser is the portal. All you
          need is a camera and the will to master the unknown.
        </p>
      </motion.div>
    </section>
  )
}
