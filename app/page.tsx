import Navbar from "@/components/sections/Navbar"
import Hero from "@/components/sections/Hero"
import Features from "@/components/sections/Features"
import MobileView from "@/components/sections/MobileView"

export default function Home() {
  return (
    <main className="relative w-full min-h-screen">
      <Navbar />
      <Hero />
      <Features />

      {/* Desktop Footer/CTA combined for brevity, hid on mobile */}
      <section className="hidden md:block relative z-10 py-32 px-12 text-center border-t border-border-dim overflow-hidden bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(201,137,10,0.06)_0%,transparent_70%)]">
        <h2 className="font-cinzel text-[clamp(2.5rem,5vw,4.5rem)] font-black text-ink mb-3">
          The Portal is Open
        </h2>
        <p className="font-crimson italic text-[1.1rem] text-ink-dim mb-12">
          Are you prepared to leave the mundane world behind?
        </p>
        <div className="flex justify-center gap-6">
          <button className="font-cinzel text-[0.7rem] font-bold tracking-[0.2em] text-bg-dark bg-gold-b px-8 py-[0.85rem] hover:bg-gold-pale transition-colors cursor-none">
            BEGIN ENLISTMENT
          </button>
          <button className="font-cinzel text-[0.7rem] font-bold tracking-[0.2em] text-gold-b border-[1.5px] border-gold-dim px-8 py-[0.85rem] hover:border-gold-b hover:bg-gold/10 transition-colors cursor-none">
            CONSULT THE ELDERS
          </button>
        </div>
      </section>

      <footer className="hidden md:flex relative z-10 p-12 border-t border-border-dim justify-between items-center">
        <div className="font-cinzel text-[0.75rem] font-bold text-gold-b tracking-[0.1em]">
          WANDCAST
        </div>
        <p className="font-fira text-[0.55rem] text-ink-faint tracking-[0.1em]">
          © 2026 WANDCAST. MASTER THE ARCANE THROUGH MOTION.
        </p>
        <ul className="flex gap-8 font-fira text-[0.6rem] tracking-[0.1em] text-ink-faint uppercase">
          <li className="hover:text-gold-dim transition-colors cursor-none">
            PRIVACY SPELL
          </li>
          <li className="hover:text-gold-dim transition-colors cursor-none">
            TERMS OF ENLISTMENT
          </li>
        </ul>
      </footer>

      {/* The separate Mobile Experience */}
      <MobileView />
    </main>
  )
}
