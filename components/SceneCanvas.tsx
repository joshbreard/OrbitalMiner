'use client'

import { Suspense, useState, useCallback, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import SolarSystem from './SolarSystem'
import Leaderboard from './Leaderboard'
import AsteroidPanel from './AsteroidPanel'
import type { ProcessedAsteroid } from '@/lib/types'

interface Props {
  asteroids: ProcessedAsteroid[]
}

const TIMELINE_MIN = -18
const TIMELINE_MAX = 4
// Movement threshold in px below which we consider it a click, not a drag
const DRAG_THRESHOLD = 4

function formatDatePill(asteroids: ProcessedAsteroid[], timelineOffset: number): string {
  const sorted = [...asteroids].sort((a, b) =>
    a.closeApproachDate.localeCompare(b.closeApproachDate)
  )
  const total = sorted.length

  const inView = sorted.filter((asteroid, i) => {
    const baseX = 2 + (i / Math.max(total - 1, 1)) * 20
    const xJitter = (Math.sin(i * 127.1) * 0.5 + 0.5) * 2.4 - 1.2
    const x = baseX + xJitter + timelineOffset
    return x >= -2 && x <= 12
  })

  if (inView.length === 0) {
    return `${total} objects tracked`
  }

  const dates = inView.map((a) => new Date(a.closeApproachDate))
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const range =
    minDate.toDateString() === maxDate.toDateString()
      ? fmt(minDate)
      : `${fmt(minDate)} → ${fmt(maxDate)}`

  return `${range} · ${inView.length} objects tracked`
}

export default function SceneCanvas({ asteroids }: Props) {
  const [selectedAsteroid, setSelectedAsteroid] = useState<ProcessedAsteroid | null>(null)
  const [timelineOffset, setTimelineOffset] = useState(0)

  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const dragStartX = useRef(0)
  const offsetAtDragStart = useRef(0)

  const handleSelectAsteroid = useCallback((asteroid: ProcessedAsteroid) => {
    setSelectedAsteroid(asteroid)
  }, [])

  const handleLeaderboardSelect = useCallback((asteroid: ProcessedAsteroid) => {
    setSelectedAsteroid(asteroid)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedAsteroid(null)
  }, [])

  // Drag handlers on the wrapper div — these run in addition to Three.js events
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isDragging.current = true
      hasDragged.current = false
      dragStartX.current = e.clientX
      offsetAtDragStart.current = timelineOffset
      ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    },
    [timelineOffset]
  )

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    const dx = e.clientX - dragStartX.current
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      hasDragged.current = true
    }
    // Drag left = time forward (asteroids shift left); drag right = backward
    const raw = offsetAtDragStart.current - dx * 0.02
    setTimelineOffset(Math.min(TIMELINE_MAX, Math.max(TIMELINE_MIN, raw)))
  }, [])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // onPointerMissed fires on the Canvas when no 3D object was hit —
  // only deselect if the user wasn't dragging
  const handlePointerMissed = useCallback(() => {
    if (!hasDragged.current) {
      setSelectedAsteroid(null)
    }
    hasDragged.current = false
  }, [])

  const datePill = useMemo(
    () => formatDatePill(asteroids, timelineOffset),
    [asteroids, timelineOffset]
  )

  return (
    <>
      {/* Drag wrapper: covers full screen, captures pointer for scrubbing */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          cursor: isDragging.current ? 'grabbing' : 'grab',
          zIndex: 0,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Canvas sits inside the drag wrapper, inherits pointer events */}
        <Canvas
          camera={{ position: [0, 2, 20], fov: 55, near: 0.01, far: 500 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: false }}
          onPointerMissed={handlePointerMissed}
        >
          <Suspense fallback={null}>
            <SolarSystem
              asteroids={asteroids}
              selectedId={selectedAsteroid?.id ?? null}
              onSelectAsteroid={handleSelectAsteroid}
              timelineOffset={timelineOffset}
            />
          </Suspense>
        </Canvas>
      </div>

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

      {/* Date pill HUD */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 999,
          padding: '6px 18px',
          fontSize: 13,
          color: '#ccc',
          letterSpacing: '0.05em',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}
      >
        {datePill}
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
