'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ProcessedAsteroid } from '@/lib/types'
import AsteroidMesh from './AsteroidMesh'

useGLTF.preload('/earth.glb')
useGLTF.preload('/sun.glb')

// Earth sphere params for collision avoidance
const EARTH_CENTER: [number, number, number] = [-8, -4, 0]
const EARTH_CLAMP_RADIUS = 6.8  // asteroids get pushed out if closer than this
const EARTH_HIDE_RADIUS = 6.5   // asteroids behind Earth within this radius are hidden

interface SolarSystemProps {
  asteroids: ProcessedAsteroid[]
  selectedId: string | null
  onSelectAsteroid: (asteroid: ProcessedAsteroid) => void
  timelineOffset: number
}

function SunModel() {
  const { scene } = useGLTF('/sun.glb')

  const cloned = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((mat) => {
          const m = mat as THREE.MeshStandardMaterial
          m.emissive = new THREE.Color('#FF8800')
          m.emissiveIntensity = 2.5
          m.toneMapped = false
        })
      }
    })
    return clone
  }, [scene])

  return (
    <primitive
      object={cloned}
      position={[30, 22, -20]}
      scale={[0.08, 0.08, 0.08]}
    />
  )
}

function EarthModel() {
  const { scene } = useGLTF('/earth.glb')
  const groupRef = useRef<THREE.Group>(null)

  const cloned = useMemo(() => {
    const clone = scene.clone()
    // Disable raycast on all Earth meshes so they never block asteroid clicks
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        ;(obj as THREE.Mesh).raycast = () => {}
      }
    })
    return clone
  }, [scene])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0008
    }
  })

  return (
    <group ref={groupRef} position={[-8, -4, 0]} scale={[6, 6, 6]}>
      <primitive object={cloned} />
    </group>
  )
}

// Raw cluster position before Earth avoidance
function getRawPosition(
  i: number,
  total: number,
  missDistanceLunar: number,
  timelineOffset: number
): [number, number, number] {
  const baseX = 2 + (i / Math.max(total - 1, 1)) * 20
  const xJitter = (Math.sin(i * 127.1) * 0.5 + 0.5) * 2.4 - 1.2
  const y = (Math.sin(i * 311.7) * 0.5 + 0.5) * 6 - 3 - missDistanceLunar / 30
  const z = (Math.sin(i * 74.3) * 0.5 + 0.5) * 5 - 2.5
  return [baseX + xJitter + timelineOffset, y, z]
}

// Apply Earth collision: hide if behind Earth, clamp if too close from the front
function resolvePosition(
  raw: [number, number, number]
): { pos: [number, number, number]; hidden: boolean } {
  const [ex, ey, ez] = EARTH_CENTER
  const dx = raw[0] - ex
  const dy = raw[1] - ey
  const dz = raw[2] - ez
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

  // Behind Earth (x < Earth center X) and inside hide threshold → don't render
  if (raw[0] < ex && dist < EARTH_HIDE_RADIUS) {
    return { pos: raw, hidden: true }
  }

  // Too close from any direction → push outward from Earth center
  if (dist < EARTH_CLAMP_RADIUS) {
    const scale = EARTH_CLAMP_RADIUS / dist
    return {
      pos: [ex + dx * scale, ey + dy * scale, ez + dz * scale],
      hidden: false,
    }
  }

  return { pos: raw, hidden: false }
}

export default function SolarSystem({
  asteroids,
  selectedId,
  onSelectAsteroid,
  timelineOffset,
}: SolarSystemProps) {
  const sorted = useMemo(
    () => [...asteroids].sort((a, b) => a.closeApproachDate.localeCompare(b.closeApproachDate)),
    [asteroids]
  )

  const resolved = useMemo(
    () =>
      sorted.map((asteroid, i) => {
        const raw = getRawPosition(i, sorted.length, asteroid.missDistanceLunar, timelineOffset)
        return resolvePosition(raw)
      }),
    [sorted, timelineOffset]
  )

  return (
    <>
      <Stars radius={200} depth={60} count={6000} factor={4} saturation={0} fade speed={0.3} />

      {/* Directional light from sun direction */}
      <directionalLight
        position={[15, 10, 5]}
        intensity={3.5}
        color="#FFF8E0"
        castShadow
      />
      {/* Earthshine fill */}
      <ambientLight color="#223344" intensity={0.25} />

      <SunModel />
      <EarthModel />

      {sorted.map((asteroid, i) => {
        const { pos, hidden } = resolved[i]
        if (hidden) return null
        return (
          <AsteroidMesh
            key={asteroid.id}
            asteroid={asteroid}
            isSelected={asteroid.id === selectedId}
            onClick={() => onSelectAsteroid(asteroid)}
            position={pos}
          />
        )
      })}
    </>
  )
}
