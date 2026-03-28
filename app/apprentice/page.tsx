import ArcanePageShell from "@/components/ui/ArcanePageShell"

const tiers = [
  {
    tier: "Initiate",
    focus: "Stability and tracking discipline.",
    details:
      "Keep your hand centered, move with medium scale, and learn what a clean wand tip lock feels like before chasing speed.",
  },
  {
    tier: "Adept",
    focus: "Shape memory and repeatability.",
    details:
      "Repeat the same spell several times in a row until the path feels inevitable, not improvised.",
  },
  {
    tier: "Duelist",
    focus: "Tempo, confidence, and transition speed.",
    details:
      "Move from one incantation to the next with less hesitation while keeping each silhouette readable to the recognizer.",
  },
]

const principles = [
  "Bigger motions beat tiny ones. Most misses come from gestures that are too small.",
  "Finish your spell cleanly. A muddy ending makes multiple spells look alike.",
  "Keep your phone stable while your hand moves. Camera shake steals precision.",
  "Use voice as reinforcement, not a replacement, when you want the cast to feel effortless.",
]

export default function ApprenticePage() {
  return (
    <ArcanePageShell
      eyebrow="Apprentice Path"
      title="Train Like an Apprentice Until the Motions Feel Like Muscle Memory."
      intro="This route is about mastery rather than spectacle: learning how to keep the tracker stable, build repeatable shapes, and cast with the kind of confidence the portal rewards."
      stats={[
        { label: "Training Tiers", value: "3" },
        { label: "Primary Skill", value: "Consistency" },
        { label: "Best Practice", value: "Large Motions" },
      ]}
    >
      <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-5">
          {tiers.map((item, index) => (
            <article
              key={item.tier}
              className="rounded-[30px] border border-border-dim bg-[linear-gradient(180deg,rgba(30,24,16,0.94),rgba(18,14,9,0.92))] p-7"
            >
              <div className="font-fira text-[0.62rem] uppercase tracking-[0.22em] text-gold-dim">
                Tier {index + 1}
              </div>
              <h2 className="mt-2 font-cinzel text-3xl font-bold text-gold-pale">
                {item.tier}
              </h2>
              <p className="mt-4 font-crimson text-xl italic text-ink">
                {item.focus}
              </p>
              <p className="mt-4 leading-8 text-ink-dim">{item.details}</p>
            </article>
          ))}
        </section>

        <aside className="rounded-[32px] border border-border-b bg-[radial-gradient(circle_at_top_left,rgba(240,180,41,0.08),transparent_34%),linear-gradient(180deg,rgba(22,18,8,0.96),rgba(15,13,8,0.96))] p-8">
          <div className="font-fira text-[0.62rem] uppercase tracking-[0.22em] text-gold-b">
            Practice Principles
          </div>
          <div className="mt-6 space-y-4">
            {principles.map((principle) => (
              <div
                key={principle}
                className="rounded-2xl border border-border-dim bg-black/15 px-4 py-4 leading-7 text-ink-dim"
              >
                {principle}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </ArcanePageShell>
  )
}
