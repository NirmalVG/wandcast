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

export default function NoxEffect({
  wandTip,
  canvasWidth,
  canvasHeight,
  onComplete,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // 1. Setup Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasWidth / canvasHeight,
      0.1,
      1000,
    )
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(canvasWidth, canvasHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Good for mobile performance
    mountRef.current.appendChild(renderer.domElement)

    // 2. Calculate the "Black Hole" Center based on wandTip
    // MediaPipe 0-1 mapped to Three.js world space
    const center = new THREE.Vector3(
      (wandTip.x - 0.5) * 10,
      -(wandTip.y - 0.5) * 10,
      0,
    )
    camera.position.z = 5

    // 3. Create the Shadow Particles
    const particleCount = 100
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities: { dx: number; dy: number; dz: number }[] = []

    for (let i = 0; i < particleCount; i++) {
      // Spawn particles in a wide, scattered radius
      const radius = 2 + Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      const startX = center.x + radius * Math.sin(phi) * Math.cos(theta)
      const startY = center.y + radius * Math.sin(phi) * Math.sin(theta)
      const startZ = center.z + radius * Math.cos(phi)

      positions[i * 3] = startX
      positions[i * 3 + 1] = startY
      positions[i * 3 + 2] = startZ

      // Calculate velocity pointing INWARD toward the center
      velocities.push({
        dx: (center.x - startX) * 0.03,
        dy: (center.y - startY) * 0.03,
        dz: (center.z - startZ) * 0.03,
      })
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    // Dark, void-like purple/black colors
    const material = new THREE.PointsMaterial({
      color: 0x1a0b2e,
      size: 0.2,
      transparent: true,
      opacity: 0, // Starts invisible, fades in
      blending: THREE.NormalBlending,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // 4. Animation Loop ("The Succ")
    let animationId: number
    let frame = 0
    const maxFrames = 45 // Faster than Lumos, snappy shutoff

    const animate = () => {
      frame++
      const positions = geometry.attributes.position.array as Float32Array

      // Fade in quickly, then fade out as it reaches the center
      if (frame < 10) material.opacity += 0.1
      if (frame > 30) material.opacity -= 0.08

      for (let i = 0; i < particleCount; i++) {
        // Move inward
        positions[i * 3] += velocities[i].dx
        positions[i * 3 + 1] += velocities[i].dy
        positions[i * 3 + 2] += velocities[i].dz

        // Accelerate as they get closer (Gravity effect)
        velocities[i].dx *= 1.12
        velocities[i].dy *= 1.12
        velocities[i].dz *= 1.12
      }

      geometry.attributes.position.needsUpdate = true
      renderer.render(scene, camera)

      if (frame < maxFrames) {
        animationId = requestAnimationFrame(animate)
      } else {
        onComplete() // Tell React the spell is done!
      }
    }

    animate()

    // 5. Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [wandTip, canvasWidth, canvasHeight, onComplete])

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />
}
