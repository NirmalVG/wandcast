"use client"
import { motion, Variants } from "framer-motion"
import { Camera } from "lucide-react"
import Link from "next/link"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
}

export default function Hero() {
  return (
    <section className="hidden md:grid relative z-10 min-h-screen grid-cols-2 items-center px-12 pt-[60px] gap-16 overflow-hidden">
      {/* Vignette Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_80%_at_0%_50%,rgba(201,137,10,0.06)_0%,transparent_60%),radial-gradient(ellipse_40%_60%_at_100%_30%,rgba(201,137,10,0.04)_0%,transparent_50%)]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        className="py-16"
      >
        <motion.div
          variants={fadeUp}
          className="font-fira text-[0.65rem] tracking-[0.25em] text-gold uppercase mb-6"
        >
          A NEW ERA OF CASTING
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="font-cinzel text-[clamp(3.5rem,6vw,6rem)] font-black leading-none text-ink mb-4 tracking-tight"
        >
          WandCast
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="font-crimson italic text-2xl text-gold-pale mb-6"
        >
          Master the Art of Wandless Magic.
        </motion.p>
        <motion.p
          variants={fadeUp}
          className="text-base leading-[1.75] text-ink-dim max-w-[440px] mb-10"
        >
          Harness the ancient power of the arcane using only your hands.
          Leveraging cutting-edge{" "}
          <strong className="text-gold-pale font-semibold">MediaPipe</strong>{" "}
          hand-tracking technology, WandCast bridges the gap between the
          physical and the mystical in a revolutionary AR environment.
        </motion.p>

        <motion.div variants={fadeUp} className="flex items-center gap-6">
          <Link
            href="/camera"
            className="relative overflow-hidden font-cinzel text-[0.7rem] font-bold tracking-[0.2em] text-bg-dark bg-gold-b border-2 border-gold-b px-8 py-[0.85rem] transition-all hover:-translate-y-0.5 hover:bg-gold-pale hover:border-gold-pale cursor-none group"
          >
            <span className="relative z-10">READY YOUR WAND</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </Link>
          <div className="font-fira text-[0.65rem] text-ink-faint tracking-[0.1em] flex items-center gap-1.5">
            <Camera size={14} /> [ REQUIRES CAMERA ACCESS ]
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.6 }}
        className="flex justify-center items-center py-16"
      >
        <div className="bg-[#1e1810]/90 border border-border-b rounded-sm p-6 w-full max-w-[380px] shadow-[0_0_60px_rgba(201,137,10,0.08),inset_0_1px_0_rgba(201,137,10,0.1)]">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-border-dim">
            <span className="font-fira text-[0.6rem] tracking-[0.2em] text-gold-dim uppercase">
              ARCANE TELEMETRY
            </span>
            <div className="w-5 h-5 border border-gold-dim flex items-center justify-center text-[0.7rem] text-gold-b animate-pulse">
              ✦
            </div>
          </div>

          {[
            { icon: "↑", name: "Lumos", hint: "Flick Up" },
            { icon: "←", name: "Accio", hint: "Sweep Left" },
            { icon: "△", name: "Protego", hint: "Form Shield" },
          ].map((spell, i) => (
            <div
              key={i}
              className="group relative flex items-center p-3 bg-gold/5 border border-border-dim rounded-sm mb-2 transition-all hover:bg-gold/10 hover:border-border-b hover:translate-x-1 cursor-none"
            >
              <div className="w-7 h-7 bg-gold/15 border border-border-b flex items-center justify-center text-[0.8rem] mr-3 shrink-0">
                {spell.icon}
              </div>
              <span className="font-cinzel text-[0.9rem] font-semibold text-ink flex-1">
                {spell.name}
              </span>
              <span className="font-fira text-[0.6rem] text-ink-faint tracking-[0.05em]">
                {spell.hint}
              </span>
            </div>
          ))}

          <div className="mt-4 pt-3 border-t border-border-dim flex justify-between items-center">
            <span className="font-fira text-[0.6rem] text-gold-dim tracking-[0.1em]">
              STABILITY:
            </span>
            <div className="flex-1 mx-4 h-[3px] bg-gold/15 rounded-sm overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "98.4%" }}
                transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-gold-dim to-gold-b"
              />
            </div>
            <span className="font-fira text-[0.6rem] text-gold-b">98.4%</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
