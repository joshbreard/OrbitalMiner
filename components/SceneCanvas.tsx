'use client'

import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import SolarSystem from './SolarSystem'
import Leaderboard from './Leaderboard'
import AsteroidPanel from './AsteroidPanel'
import type { ProcessedAsteroid } from '@/lib/types'

interface Props {
  asteroids: ProcessedAsteroid[]
}

export default function SceneCanvas({ asteroids }: Props) {
  const [selectedAsteroid, setSelectedAsteroid] = useState<ProcessedAsteroid | null>(null)
  const [flyToId, setFlyToId] = useState<string | null>(null)

  const handleSelectAsteroid = useCallback((asteroid: ProcessedAsteroid) => {
    setSelectedAsteroid(asteroid)
  }, [])

  const handleLeaderboardSelect = useCallback((asteroid: ProcessedAsteroid) => {
    setSelectedAsteroid(asteroid)
    setFlyToId(asteroid.id)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedAsteroid(null)
  }, [])

  return (
    <>
      {/* Full-screen 3D canvas */}
      <Canvas
        camera={{ position: [0, 18, 28], fov: 55, near: 0.01, far: 500 }}
        style={{ position: 'fixed', inset: 0 }}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => setSelectedAsteroid(null)}
      >
        <Suspense fallback={null}>
          <SolarSystem
            asteroids={asteroids}
            selectedId={selectedAsteroid?.id ?? null}
            onSelectAsteroid={handleSelectAsteroid}
            flyToId={flyToId}
            onFlyComplete={() => setFlyToId(null)}
          />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          minDistance={3}
          maxDistance={80}
          zoomSpeed={0.8}
          rotateSpeed={0.5}
          panSpeed={0.8}
        />
      </Canvas>

      {/* Header overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '12px 20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 800, color: '#00e5ff', letterSpacing: '-0.02em' }}>
          ◈ ORBITALMINER
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          Near-Earth Asteroid Economic Value Tracker · {asteroids.length} asteroids this week
        </span>
      </div>

      {/* Leaderboard */}
      <Leaderboard
        asteroids={asteroids}
        selectedId={selectedAsteroid?.id ?? null}
        onSelect={handleLeaderboardSelect}
      />

      {/* Detail panel */}
      {selectedAsteroid && (
        <AsteroidPanel asteroid={selectedAsteroid} onClose={handleClose} />
      )}
    </>
  )
}
