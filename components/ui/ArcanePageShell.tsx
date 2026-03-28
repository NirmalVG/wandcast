import Link from "next/link"
import type { ReactNode } from "react"
import Navbar from "@/components/sections/Navbar"

interface Stat {
  label: string
  value: string
}

interface ArcanePageShellProps {
  eyebrow: string
  title: string
  intro: string
  stats: Stat[]
  children: ReactNode
}

export default function ArcanePageShell({
  eyebrow,
  title,
  intro,
  stats,
  children,
}: ArcanePageShellProps) {
  return (
    <main className="min-h-screen bg-bg-dark text-ink">
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-18 pt-[112px] md:px-12 md:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(240,180,41,0.12),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(100,200,255,0.1),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(15,13,8,0))]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-b/60 to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 font-fira text-[0.68rem] uppercase tracking-[0.3em] text-gold-b md:mb-10">
            {eyebrow}
          </div>

          <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] md:items-end">
            <div>
              <h1 className="max-w-4xl font-cinzel text-[clamp(2.7rem,7vw,5.8rem)] font-black leading-[0.96] text-ink">
                {title}
              </h1>
              <p className="mt-6 max-w-2xl font-crimson text-[1.15rem] italic leading-8 text-gold-pale md:text-[1.35rem]">
                {intro}
              </p>
            </div>

            <div className="rounded-[28px] border border-border-b bg-[linear-gradient(180deg,rgba(30,24,16,0.96),rgba(18,14,9,0.92))] p-5 shadow-[0_0_60px_rgba(201,137,10,0.08)]">
              <div className="mb-4 font-fira text-[0.62rem] uppercase tracking-[0.24em] text-gold-dim">
                Arcane Index
              </div>
              <div className="grid gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-2xl border border-border-dim bg-gold/5 px-4 py-3"
                  >
                    <span className="font-fira text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
                      {stat.label}
                    </span>
                    <span className="font-cinzel text-lg font-semibold text-gold-pale">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 md:px-12">
        {children}
      </section>

      <section className="border-t border-border-dim bg-[radial-gradient(circle_at_center,rgba(201,137,10,0.08),transparent_55%)] px-6 py-16 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="font-fira text-[0.62rem] uppercase tracking-[0.22em] text-gold-dim">
              Portal Access
            </div>
            <h2 className="mt-3 font-cinzel text-3xl font-bold text-ink md:text-4xl">
              Ready to turn study into spectacle?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-ink-dim md:text-base">
              Step into the live camera portal and test your form with the full WandCast visual engine.
            </p>
          </div>

          <Link
            href="/camera"
            className="rounded-full border border-gold-b bg-gold-b px-7 py-3 font-cinzel text-[0.72rem] font-bold tracking-[0.22em] text-bg-dark transition-all hover:-translate-y-0.5 hover:bg-gold-pale"
          >
            READY YOUR WAND
          </Link>
        </div>
      </section>
    </main>
  )
}
