'use client'

import type { ProcessedAsteroid } from '@/lib/types'
import { formatValue } from '@/lib/composition'

interface Props {
  asteroids: ProcessedAsteroid[]
  selectedId: string | null
  onSelect: (asteroid: ProcessedAsteroid) => void
}

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  M: { label: 'M', color: '#FFD700' },
  C: { label: 'C', color: '#888888' },
  S: { label: 'S', color: '#C19A6B' },
  unknown: { label: '?', color: '#888888' },
}

export default function Leaderboard({ asteroids, selectedId, onSelect }: Props) {
  const top10 = asteroids.slice(0, 10)

  return (
    <div
      className="glass"
      style={{
        position: 'fixed',
        top: '50%',
        left: 16,
        transform: 'translateY(-50%)',
        width: 260,
        maxHeight: 'calc(100vh - 80px)',
        borderRadius: 12,
        padding: '16px 12px',
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h2
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#00e5ff',
            margin: 0,
          }}
        >
          ◆ Top Targets
        </h2>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
          by estimated economic value
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {top10.map((asteroid, i) => {
          const badge = TYPE_BADGE[asteroid.spectralType] ?? TYPE_BADGE.unknown
          const isSelected = asteroid.id === selectedId
          return (
            <button
              key={asteroid.id}
              onClick={() => onSelect(asteroid)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                background: isSelected
                  ? 'rgba(0,229,255,0.12)'
                  : 'rgba(255,255,255,0.03)',
                border: isSelected
                  ? '1px solid rgba(0,229,255,0.5)'
                  : '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                width: '100%',
              }}
            >
              {/* Rank */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: i < 3 ? '#FFD700' : 'rgba(255,255,255,0.3)',
                  minWidth: 16,
                  marginTop: 1,
                }}
              >
                {i + 1}
              </span>

              {/* Type badge */}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: badge.color,
                  background: `${badge.color}22`,
                  border: `1px solid ${badge.color}55`,
                  borderRadius: 3,
                  padding: '1px 4px',
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                {badge.label}
              </span>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#fff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {asteroid.name.replace(/^\(?\d+\)?\s*/, '')}
                </div>
                <div style={{ fontSize: 12, color: '#00e5ff', fontWeight: 700, marginTop: 2 }}>
                  {formatValue(asteroid.economicValueUsd)}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                  Approach: {asteroid.closeApproachDate}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
