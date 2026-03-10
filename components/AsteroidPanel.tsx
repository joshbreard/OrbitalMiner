'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { ProcessedAsteroid } from '@/lib/types'
import { formatValue, calculateEconomicValue } from '@/lib/composition'

interface Props {
  asteroid: ProcessedAsteroid
  onClose: () => void
}

const MINERAL_COLORS: Record<string, string> = {
  Iron: '#b87333',
  Nickel: '#a8a9ad',
  Platinum: '#e5e4e2',
  Water: '#4fc3f7',
  Silicate: '#8d7054',
}

const TYPE_LABEL: Record<string, string> = {
  M: 'M-type (Metallic)',
  C: 'C-type (Carbonaceous)',
  S: 'S-type (Silicaceous)',
  unknown: 'S-type (Unknown)',
}

export default function AsteroidPanel({ asteroid, onClose }: Props) {
  const [efficiency, setEfficiency] = useState(100)

  const liveValue = calculateEconomicValue(
    asteroid.avgDiameterM,
    asteroid.spectralType,
    efficiency / 100
  )

  const chartData = [
    { name: 'Iron', value: asteroid.composition.iron },
    { name: 'Nickel', value: asteroid.composition.nickel },
    { name: 'Platinum', value: asteroid.composition.platinum },
    { name: 'Water', value: asteroid.composition.water },
    { name: 'Silicate', value: asteroid.composition.silicate },
  ].filter((d) => d.value > 0)

  return (
    <div
      className="glass"
      style={{
        position: 'fixed',
        top: '50%',
        right: 16,
        transform: 'translateY(-50%)',
        width: 320,
        maxHeight: 'calc(100vh - 80px)',
        borderRadius: 12,
        padding: 20,
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
            {asteroid.name}
          </h2>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0', fontFamily: 'monospace' }}>
            SPK-ID: {asteroid.spkId}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: '4px 8px',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Spectral type badge */}
      <div style={{ marginBottom: 14 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 4,
            background:
              asteroid.spectralType === 'M'
                ? 'rgba(255,215,0,0.15)'
                : asteroid.spectralType === 'C'
                ? 'rgba(136,136,136,0.2)'
                : 'rgba(193,154,107,0.2)',
            color:
              asteroid.spectralType === 'M'
                ? '#FFD700'
                : asteroid.spectralType === 'C'
                ? '#aaa'
                : '#C19A6B',
            border: '1px solid',
            borderColor:
              asteroid.spectralType === 'M'
                ? 'rgba(255,215,0,0.4)'
                : asteroid.spectralType === 'C'
                ? 'rgba(136,136,136,0.4)'
                : 'rgba(193,154,107,0.4)',
          }}
        >
          {TYPE_LABEL[asteroid.spectralType]}
        </span>
        {asteroid.isPotentiallyHazardous && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 4,
              background: 'rgba(255,80,80,0.15)',
              color: '#ff6b6b',
              border: '1px solid rgba(255,80,80,0.4)',
              marginLeft: 6,
            }}
          >
            ⚠ PHA
          </span>
        )}
      </div>

      <Divider />

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <Stat label="Min Diameter" value={`${asteroid.estimatedDiameterMinM.toFixed(1)} m`} />
        <Stat label="Max Diameter" value={`${asteroid.estimatedDiameterMaxM.toFixed(1)} m`} />
        <Stat label="Approach Date" value={asteroid.closeApproachDate} />
        <Stat label="Miss Distance" value={`${asteroid.missDistanceLunar.toFixed(2)} LD`} />
        <Stat label="Velocity" value={`${asteroid.relativeVelocityKmS.toFixed(2)} km/s`} />
        <Stat label="Distance (km)" value={`${(asteroid.missDistanceKm / 1e6).toFixed(2)}M km`} />
      </div>

      <Divider />

      {/* Composition chart */}
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>Mineral Composition</SectionLabel>
        <div style={{ height: 130, marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }}
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                formatter={(v: unknown) => [`${Number(v).toFixed(3)}%`, 'Composition']}
                contentStyle={{
                  background: 'rgba(10,10,20,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#fff',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={MINERAL_COLORS[entry.name] ?? '#888'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Divider />

      {/* Economic value */}
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>Economic Value</SectionLabel>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#00e5ff',
            letterSpacing: '-0.02em',
            marginTop: 6,
          }}
        >
          {formatValue(liveValue)}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
          at {efficiency}% extraction efficiency
        </div>
      </div>

      {/* Extraction slider */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 6,
          }}
        >
          <span>What If We Mined It?</span>
          <span style={{ color: '#00e5ff', fontWeight: 700 }}>{efficiency}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={efficiency}
          onChange={(e) => setEfficiency(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#00e5ff',
            cursor: 'pointer',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
          <span>1% (Initial probe)</span>
          <span>100% (Full extraction)</span>
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: 'rgba(255,255,255,0.07)',
        margin: '12px 0',
      }}
    />
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        margin: 0,
      }}
    >
      {children}
    </p>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, marginTop: 2 }}>
        {value}
      </div>
    </div>
  )
}
