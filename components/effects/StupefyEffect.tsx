"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type { WandPoint } from "@/types"

interface Props {
  wandTip: WandPoint
  canvasWidth: number
  canvasHeight: number
  onComplete: () => void
}

export default function StupefyEffect({
  wandTip,
  canvasWidth,
  canvasHeight,
  onComplete,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasWidth / canvasHeight,
      0.1,
      1000,
    )
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(canvasWidth, canvasHeight)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const center = new THREE.Vector3(
      (wandTip.x - 0.5) * 10,
      -(wandTip.y - 0.5) * 10,
      0,
    )
    camera.position.z = 5

    // Projectile core (Red blast)
    const geometry = new THREE.BufferGeometry()
    const particleCount = 150
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      // Keep them tightly clustered
      positions[i * 3] = center.x + (Math.random() - 0.5) * 0.5
      positions[i * 3 + 1] = center.y + (Math.random() - 0.5) * 0.5
      positions[i * 3 + 2] = center.z + (Math.random() - 0.5) * 2
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xff0000, // Aggressive Red
      size: 0.4,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    })

    const blast = new THREE.Points(geometry, material)
    scene.add(blast)

    let animationId: number
    let frame = 0
    const maxFrames = 35 // Very fast spell

    const animate = () => {
      frame++

      // Shoot deep into the background (Negative Z)
      blast.position.z -= 0.8

      // Add a slight recoil/shake effect to the particles
      const positions = geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += (Math.random() - 0.5) * 0.1
        positions[i * 3 + 1] += (Math.random() - 0.5) * 0.1
      }
      geometry.attributes.position.needsUpdate = true

      // Trail fade out
      if (frame > 20) material.opacity -= 0.08

      renderer.render(scene, camera)

      if (frame < maxFrames) {
        animationId = requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      if (mountRef.current && renderer.domElement)
        mountRef.current.removeChild(renderer.domElement)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [wandTip, canvasWidth, canvasHeight, onComplete])

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />
}
