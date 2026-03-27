import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-[100] items-center justify-between px-12 h-[60px] border-b border-border-dim bg-[#0f0d08]/85 backdrop-blur-md">
      <div className="flex items-center gap-2 font-cinzel font-bold text-sm tracking-[0.15em] text-gold-b">
        <div className="w-[26px] h-[26px] border-[1.5px] border-gold flex items-center justify-center text-[0.9rem]">
          W
        </div>
        WANDCAST
      </div>
      <ul className="flex gap-10 list-none">
        {["GRIMOIRE", "SPELLS", "APPRENTICE", "PORTAL"].map((item, i) => (
          <li key={i}>
            <a
              href="#"
              className={`font-cinzel text-[0.7rem] font-medium tracking-[0.12em] transition-colors relative ${i === 0 ? "text-gold-b border-b border-gold-b pb-1" : "text-ink-dim hover:text-ink"}`}
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
      <Link
        href="/camera"
        className="font-cinzel text-[0.65rem] font-bold tracking-[0.2em] text-bg-dark bg-gold-b px-5 py-2 hover:bg-gold-pale transition-all hover:-translate-y-[1px] cursor-none block"
      >
        READY YOUR WAND
      </Link>
    </nav>
  )
}
