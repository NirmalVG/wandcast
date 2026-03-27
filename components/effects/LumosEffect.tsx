"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type { WandPoint } from "@/types"

interface Props {
  wandTip: WandPoint // where to spawn the effect
  canvasWidth: number
  canvasHeight: number
  onComplete: () => void // called when effect finishes
}

// Particle count — keep at 200 for 60fps on mobile
const PARTICLE_COUNT = 200
const DURATION_MS = 2000

export default function LumosEffect({
  wandTip,
  canvasWidth,
  canvasHeight,
  onComplete,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── SCENE SETUP ──────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(
      0,
      canvasWidth, // left, right
      0,
      -canvasHeight, // top, bottom (flipped — canvas Y goes down)
      0.1,
      100,
    )
    camera.position.z = 1

    const renderer = new THREE.WebGLRenderer({
      alpha: true, // transparent background
      antialias: true,
    })
    renderer.setSize(canvasWidth, canvasHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0) // fully transparent
    mount.appendChild(renderer.domElement)

    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
    })

    // ── CONVERT NORMALIZED WAND TIP → SCREEN COORDS ──────────────────────────
    // MediaPipe gives 0-1, Three.js orthographic uses pixel coords
    // Also mirror X because video is mirrored
    const sx = wandTip.x * canvasWidth
    const sy = wandTip.y * canvasHeight

    // ── PARTICLES ────────────────────────────────────────────────────────────
    const geometry = new THREE.BufferGeometry()

    // Pre-allocate typed arrays — no garbage collection
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3

      // All particles start at wand tip
      positions[i3] = sx
      positions[i3 + 1] = sy
      positions[i3 + 2] = 0

      // Random spherical velocity
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 4 + 1
      const spread = (Math.random() - 0.5) * 2 // vertical spread

      velocities[i3] = Math.cos(angle) * speed
      velocities[i3 + 1] = Math.sin(angle) * speed + spread
      velocities[i3 + 2] = 0

      // Color range: white core → gold → orange
      const t = Math.random()
      if (t < 0.3) {
        // White-hot core particles
        colors[i3] = 1
        colors[i3 + 1] = 1
        colors[i3 + 2] = 1
      } else if (t < 0.7) {
        // Gold particles
        colors[i3] = 1
        colors[i3 + 1] = 0.75
        colors[i3 + 2] = 0.1
      } else {
        // Orange particles
        colors[i3] = 1
        colors[i3 + 1] = 0.45
        colors[i3 + 2] = 0.0
      }

      sizes[i] = Math.random() * 6 + 2
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    // ── SHADER MATERIAL ──────────────────────────────────────────────────────
    // Custom shaders give us circular soft particles (not squares)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 1.0 },
        uTime: { value: 0.0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (1.0 - uTime * 0.5);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uOpacity;

        void main() {
          // Soft circle — discard corners
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          if (dist > 0.5) discard;

          // Soft glow falloff
          float alpha = (1.0 - dist * 2.0) * uOpacity;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      vertexColors: true,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // ── CENTRAL ORB ──────────────────────────────────────────────────────────
    const orbGeo = new THREE.CircleGeometry(20, 32)
    const orbMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
    })
    const orb = new THREE.Mesh(orbGeo, orbMat)
    orb.position.set(sx, sy, 0)
    scene.add(orb)

    // ── GLOW RING ─────────────────────────────────────────────────────────────
    const ringGeo = new THREE.RingGeometry(22, 40, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf0b429,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.set(sx, sy, 0)
    scene.add(ring)

    // ── ANIMATION LOOP ───────────────────────────────────────────────────────
    const startTime = performance.now()
    let rafId: number

    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute

    const animate = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / DURATION_MS, 1) // 0 → 1
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic

      // Update particle positions
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3
        // Decelerate over time — particles slow to a stop
        const friction = 1 - progress * 0.85
        posAttr.array[i3] += velocities[i3] * friction
        posAttr.array[i3 + 1] += velocities[i3 + 1] * friction
      }
      posAttr.needsUpdate = true

      // Fade everything out
      const opacity = 1 - eased
      material.uniforms.uOpacity.value = opacity
      material.uniforms.uTime.value = progress
      orbMat.opacity = (1 - progress) * 1.0
      ringMat.opacity = (1 - progress) * 0.6

      // Scale orb up then shrink
      const orbScale =
        progress < 0.3
          ? 1 + progress * 3 // expand fast
          : 1 + 0.9 - progress * 2 // then shrink
      orb.scale.set(Math.max(0, orbScale), Math.max(0, orbScale), 1)
      ring.scale.set(1 + progress * 2, 1 + progress * 2, 1)

      renderer.render(scene, camera)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }

    rafId = requestAnimationFrame(animate)

    // ── CLEANUP ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      geometry.dispose()
      material.dispose()
      orbGeo.dispose()
      orbMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [wandTip, canvasWidth, canvasHeight, onComplete])

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />
}
