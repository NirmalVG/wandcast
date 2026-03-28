import ArcanePageShell from "@/components/ui/ArcanePageShell"

const pillars = [
  {
    title: "Gesture Intelligence",
    description:
      "WandCast watches your fingertip trajectory, normalizes the path, and compares it to spell templates so the casting ritual feels deliberate rather than button-driven.",
  },
  {
    title: "Browser-Born Magic",
    description:
      "The portal is powered client-side with camera vision and premium effects, so the experience feels immediate on modern phones without specialized hardware.",
  },
  {
    title: "Cinematic Feedback",
    description:
      "Every successful cast blooms into layered particles, light, and motion designed to reward precision and make the app feel portfolio-grade on first impression.",
  },
]

const archives = [
  "The system is tuned for phone-scale wand motion, not tiny wrist twitches.",
  "Voice incantations can reinforce a cast when pronunciation and gesture align.",
  "The visual language stays rooted in parchment, gold, obsidian, and atmospheric blue.",
]

export default function GrimoirePage() {
  return (
    <ArcanePageShell
      eyebrow="The Grimoire"
      title="The World, Rules, and Rituals Behind WandCast."
      intro="This is the codex for the portal itself: how the experience is framed, what makes it magical, and why the interaction feels more like spellcraft than software."
      stats={[
        { label: "Core Discipline", value: "Gesture AR" },
        { label: "Casting Surface", value: "Mobile Web" },
        { label: "Arcane Tone", value: "Premium" },
      ]}
    >
      <div className="grid gap-8 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-[28px] border border-border-dim bg-[linear-gradient(180deg,rgba(30,24,16,0.94),rgba(18,14,9,0.92))] p-7 shadow-[0_0_40px_rgba(0,0,0,0.18)]"
          >
            <div className="mb-4 font-fira text-[0.62rem] uppercase tracking-[0.22em] text-gold-dim">
              Pillar
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-ink">
              {pillar.title}
            </h2>
            <p className="mt-4 leading-8 text-ink-dim">{pillar.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[30px] border border-border-b bg-[radial-gradient(circle_at_top_left,rgba(240,180,41,0.08),transparent_34%),linear-gradient(180deg,rgba(22,18,8,0.96),rgba(15,13,8,0.96))] p-8">
          <div className="font-fira text-[0.62rem] uppercase tracking-[0.22em] text-gold-b">
            Field Notes
          </div>
          <h2 className="mt-4 font-cinzel text-3xl font-bold text-ink">
            What makes the portal feel convincing.
          </h2>
          <p className="mt-4 max-w-2xl leading-8 text-ink-dim">
            The best magical interfaces don’t just respond. They anticipate intent, reward confidence, and frame every motion with visual consequence. WandCast is built around that principle.
          </p>
        </section>

        <aside className="rounded-[30px] border border-border-dim bg-bg-card/80 p-8">
          <div className="font-fira text-[0.62rem] uppercase tracking-[0.22em] text-gold-dim">
            Archive Fragments
          </div>
          <div className="mt-5 space-y-4">
            {archives.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border-dim bg-black/15 px-4 py-4 leading-7 text-ink-dim"
              >
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </ArcanePageShell>
  )
}
