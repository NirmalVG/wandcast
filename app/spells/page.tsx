import ArcanePageShell from "@/components/ui/ArcanePageShell"

const ritualSteps = [
  {
    title: "Open the Portal",
    description:
      "Enter the camera view, allow camera access, and keep your phone steady so the wand tip can lock cleanly onto your index finger.",
  },
  {
    title: "Trace with Intention",
    description:
      "Use larger, deliberate motions. The recognizer is looking for the full path of the spell, not a tiny wrist flick.",
  },
  {
    title: "Let Gesture and Voice Align",
    description:
      "You can reinforce recognition by speaking the incantation while tracing the correct motion. When both agree, the cast becomes more forgiving.",
  },
]

const spells = [
  {
    name: "Lumos",
    effect: "Ignites the scene with radiant light.",
    movement: "Straight upward flick.",
    tip: "Start low and rise confidently through the center of your frame.",
  },
  {
    name: "Nox",
    effect: "Snuffs the glow back into shadow.",
    movement: "Straight downward sweep.",
    tip: "Mirror the Lumos motion, but drive it down with a clean finish.",
  },
  {
    name: "Accio",
    effect: "Pulls distant energy inward.",
    movement: "Curved pull to the left.",
    tip: "Make the curve obvious. A shallow line usually reads as a miss.",
  },
  {
    name: "Expelliarmus",
    effect: "Launches a hot, disarming blast.",
    movement: "Sharp flick right, then down.",
    tip: "Think of it as one aggressive stroke with a hard directional change.",
  },
  {
    name: "Stupefy",
    effect: "Fires a fast stunning strike.",
    movement: "Quick zigzag: left → right → left.",
    tip: "Keep the rhythm tight and energetic so the zigzag shape stays distinct.",
  },
  {
    name: "Protego",
    effect: "Raises a luminous defensive shield.",
    movement: "Clockwise circle.",
    tip: "A full rounded loop works better than a cramped half-circle.",
  },
  {
    name: "Wingardium",
    effect: "Lifts and suspends motion with elegance.",
    movement: "S-curve swish, then flick.",
    tip: "Let the curve breathe before the finishing snap.",
  },
  {
    name: "Patronum",
    effect: "Summons a flowing spectral guardian burst.",
    movement: "Large flowing S-curve.",
    tip: "Use your biggest, smoothest motion here. This one rewards scale.",
  },
]

export default function SpellsPage() {
  return (
    <ArcanePageShell
      eyebrow="Spell Index"
      title="Every Spell, Every Motion, and Exactly How to Use It."
      intro="Study the movement language before you enter the portal. Each spell responds best to large, intentional traces that match the shape of the incantation."
      stats={[
        { label: "Active Spells", value: "8" },
        { label: "Recognition Style", value: "Path Match" },
        { label: "Best Input", value: "Confident Motion" },
      ]}
    >
      <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[30px] border border-border-b bg-[radial-gradient(circle_at_top_left,rgba(240,180,41,0.08),transparent_36%),linear-gradient(180deg,rgba(28,22,14,0.96),rgba(16,12,8,0.96))] p-8">
          <div className="font-fira text-[0.62rem] uppercase tracking-[0.22em] text-gold-b">
            Casting Ritual
          </div>
          <div className="mt-6 space-y-5">
            {ritualSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-border-dim bg-black/15 px-5 py-5"
              >
                <div className="font-fira text-[0.62rem] uppercase tracking-[0.18em] text-gold-dim">
                  Step {index + 1}
                </div>
                <h2 className="mt-2 font-cinzel text-2xl font-bold text-ink">
                  {step.title}
                </h2>
                <p className="mt-3 leading-8 text-ink-dim">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5">
          {spells.map((spell) => (
            <article
              key={spell.name}
              className="rounded-[28px] border border-border-dim bg-[linear-gradient(180deg,rgba(30,24,16,0.96),rgba(18,14,9,0.94))] p-6 shadow-[0_0_36px_rgba(0,0,0,0.18)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-fira text-[0.62rem] uppercase tracking-[0.22em] text-gold-dim">
                    Spell
                  </div>
                  <h2 className="mt-2 font-cinzel text-3xl font-bold text-gold-pale">
                    {spell.name}
                  </h2>
                  <p className="mt-3 max-w-xl leading-8 text-ink-dim">
                    {spell.effect}
                  </p>
                </div>

                <div className="rounded-2xl border border-border-b bg-gold/5 px-4 py-3 md:min-w-[240px]">
                  <div className="font-fira text-[0.6rem] uppercase tracking-[0.18em] text-gold-b">
                    Hand Movement
                  </div>
                  <div className="mt-2 font-crimson text-lg italic text-ink">
                    {spell.movement}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border-dim bg-black/15 px-4 py-4 leading-7 text-ink-dim">
                <span className="font-fira text-[0.62rem] uppercase tracking-[0.18em] text-gold-dim">
                  Casting Tip
                </span>
                <p className="mt-2">{spell.tip}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </ArcanePageShell>
  )
}
