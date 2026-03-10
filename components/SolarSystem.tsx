'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ProcessedAsteroid } from '@/lib/types'
import AsteroidMesh from './AsteroidMesh'

interface SolarSystemProps {
  asteroids: ProcessedAsteroid[]
  selectedId: string | null
  onSelectAsteroid: (asteroid: ProcessedAsteroid) => void
  flyToId: string | null
  onFlyComplete: () => void
}

function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.02
      glowRef.current.scale.setScalar(s)
    }
  })

  return (
    <group>
      {/* Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshStandardMaterial
          color="#FDB813"
          emissive="#FF6600"
          emissiveIntensity={2}
          roughness={0.8}
        />
      </mesh>
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshBasicMaterial
          color="#FF8800"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Point light source */}
      <pointLight color="#FFF8E0" intensity={3} distance={120} decay={1.2} />
    </group>
  )
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.2
    if (cloudRef.current) cloudRef.current.rotation.y = clock.getElapsedTime() * 0.25
  })

  return (
    <group position={[10, 0, 0]}>
      {/* Earth body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#1a6fa8" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Continent patches (simplified) */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshStandardMaterial
          color="#2d8a3e"
          transparent
          opacity={0.35}
          roughness={1}
          wireframe={false}
        />
      </mesh>
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[0.68, 32, 32]} />
        <meshBasicMaterial color="#4fc3f7" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function OrbitalRing({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
    }
    return pts
  }, [radius])

  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    const mat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.06 })
    return new THREE.Line(geo, mat)
  }, [points])

  return <primitive object={lineObj} />
}

export default function SolarSystem({
  asteroids,
  selectedId,
  onSelectAsteroid,
  flyToId,
  onFlyComplete,
}: SolarSystemProps) {
  const { camera } = useThree()
  const flyTarget = useRef<THREE.Vector3 | null>(null)
  const flyingRef = useRef(false)

  // Set fly target when flyToId changes
  useMemo(() => {
    if (!flyToId) return
    const target = asteroids.find((a) => a.id === flyToId)
    if (!target) return
    const x = Math.cos(target.orbitAngle) * target.orbitRadius
    const z = Math.sin(target.orbitAngle) * target.orbitRadius
    flyTarget.current = new THREE.Vector3(x + 1.5, 1.5, z + 1.5)
    flyingRef.current = true
  }, [flyToId, asteroids])

  useFrame(() => {
    if (!flyingRef.current || !flyTarget.current) return
    camera.position.lerp(flyTarget.current, 0.05)
    if (camera.position.distanceTo(flyTarget.current) < 0.1) {
      flyingRef.current = false
      flyTarget.current = null
      onFlyComplete()
    }
  })

  return (
    <>
      <Stars radius={200} depth={60} count={6000} factor={4} saturation={0} fade speed={0.3} />
      <ambientLight intensity={0.15} />

      <Sun />
      <Earth />

      {/* Earth orbit ring */}
      <OrbitalRing radius={10} />

      {/* Asteroid orbit rings */}
      {[8, 12, 16].map((r) => (
        <OrbitalRing key={r} radius={r} />
      ))}

      {/* Asteroids */}
      {asteroids.map((asteroid) => (
        <AsteroidMesh
          key={asteroid.id}
          asteroid={asteroid}
          isSelected={asteroid.id === selectedId}
          onClick={() => onSelectAsteroid(asteroid)}
        />
      ))}
    </>
  )
}
