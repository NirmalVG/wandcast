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

export default function ProtegoEffect({
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
      -2, // Push it slightly into the screen
    )
    camera.position.z = 5

    // Create a geometric shield dome
    const geometry = new THREE.IcosahedronGeometry(0.1, 2)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x4da6ff, // Magical Blue
      emissive: 0x1166ff,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.8,
      wireframe: true, // Gives it that cool magic-grid look
      side: THREE.DoubleSide,
    })

    const shield = new THREE.Mesh(geometry, material)
    shield.position.copy(center)
    scene.add(shield)

    let animationId: number
    let frame = 0
    const maxFrames = 60

    const animate = () => {
      frame++

      // Expand the shield rapidly, then slow down
      if (frame < 15) {
        shield.scale.addScalar(0.4)
      } else {
        shield.scale.addScalar(0.05)
      }

      // Rotate it slowly for a cool 3D effect
      shield.rotation.y += 0.02
      shield.rotation.z += 0.01

      // Fade out at the end
      if (frame > 40) {
        material.opacity -= 0.04
        material.emissiveIntensity -= 0.1
      }

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
