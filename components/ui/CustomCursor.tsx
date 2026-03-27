"use client"
import { useEffect, useRef } from "react"

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 768) return

    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0
    let animFrameId: number

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
      }
    }

    const render = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      }
      animFrameId = requestAnimationFrame(render)
    }

    window.addEventListener("mousemove", onMouseMove)
    animFrameId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      cancelAnimationFrame(animFrameId)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="hidden md:block fixed top-0 left-0 w-2 h-2 bg-gold-b rounded-full pointer-events-none z-[9999] shadow-[0_0_12px_4px_rgba(240,180,41,0.4)] transition-transform duration-100"
      />
      <div
        ref={ringRef}
        className="hidden md:block fixed top-0 left-0 w-8 h-8 border border-gold-b/50 rounded-full pointer-events-none z-[9998] transition-all duration-150"
      />
    </>
  )
}
