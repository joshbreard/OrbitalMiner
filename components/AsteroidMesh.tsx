'use client'

import { useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ProcessedAsteroid } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  M: '#FFD700',      // gold - metallic
  C: '#555555',      // dark grey - carbonaceous
  S: '#C19A6B',      // sandy brown - silicate
  unknown: '#C19A6B',
}

const MIN_VISUAL_RADIUS = 0.06
const MAX_VISUAL_RADIUS = 0.55

interface Props {
  asteroid: ProcessedAsteroid
  isSelected: boolean
  onClick: () => void
}

export default function AsteroidMesh({ asteroid, isSelected, onClick }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const x = Math.cos(asteroid.orbitAngle) * asteroid.orbitRadius
  const z = Math.sin(asteroid.orbitAngle) * asteroid.orbitRadius
  const y = (Math.sin(asteroid.orbitAngle * 2.3) * asteroid.orbitRadius * 0.05)

  // Visual radius: scale log of diameter to reasonable range
  const logMin = Math.log10(1)
  const logMax = Math.log10(10000)
  const logVal = Math.log10(Math.max(1, asteroid.avgDiameterM))
  const t = Math.min(1, Math.max(0, (logVal - logMin) / (logMax - logMin)))
  const visualRadius = MIN_VISUAL_RADIUS + t * (MAX_VISUAL_RADIUS - MIN_VISUAL_RADIUS)

  const color = TYPE_COLORS[asteroid.spectralType] ?? TYPE_COLORS.unknown

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.3
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.5
  })

  return (
    <group position={[x, y, z]}>
      <mesh
        ref={meshRef}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        {/* Slightly irregular shape for asteroids */}
        <dodecahedronGeometry args={[visualRadius, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? '#00e5ff' : hovered ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.6 : hovered ? 0.3 : 0}
          roughness={0.85}
          metalness={asteroid.spectralType === 'M' ? 0.6 : 0.1}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[visualRadius * 1.6, 0.015, 8, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.9} />
        </mesh>
      )}

      {/* Hover label */}
      {hovered && !isSelected && (
        <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: 'rgba(0,0,0,0.75)',
              border: '1px solid rgba(0,229,255,0.5)',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 11,
              color: '#fff',
              whiteSpace: 'nowrap',
            }}
          >
            {asteroid.name}
          </div>
        </Html>
      )}
    </group>
  )
}
