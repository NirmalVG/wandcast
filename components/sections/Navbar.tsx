"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { label: "GRIMOIRE", href: "/grimoire" },
  { label: "SPELLS", href: "/spells" },
  { label: "APPRENTICE", href: "/apprentice" },
] as const

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 right-0 top-0 z-[100] hidden h-[60px] items-center justify-between border-b border-border-dim bg-[#0f0d08]/85 px-12 backdrop-blur-md md:flex">
      <Link
        href="/"
        className="flex items-center gap-2 font-cinzel text-sm font-bold tracking-[0.15em] text-gold-b"
      >
        <div className="flex h-[26px] w-[26px] items-center justify-center border-[1.5px] border-gold text-[0.9rem]">
          W
        </div>
        WANDCAST
      </Link>

      <ul className="flex list-none gap-10">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative font-cinzel text-[0.7rem] font-medium tracking-[0.12em] transition-colors ${
                  isActive
                    ? "border-b border-gold-b pb-1 text-gold-b"
                    : "text-ink-dim hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <Link
        href="/camera"
        className="block cursor-none bg-gold-b px-5 py-2 font-cinzel text-[0.65rem] font-bold tracking-[0.2em] text-bg-dark transition-all hover:-translate-y-[1px] hover:bg-gold-pale"
      >
        READY YOUR WAND
      </Link>
    </nav>
  )
}
