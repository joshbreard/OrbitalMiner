import {
  getSpectralType,
  calculateEconomicValue,
  COMPOSITION_TABLE,
} from './composition'
import type { ProcessedAsteroid } from './types'

interface NasaNeo {
  id: string
  neo_reference_id: string
  name: string
  is_potentially_hazardous_asteroid: boolean
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number
      estimated_diameter_max: number
    }
  }
  close_approach_data: Array<{
    close_approach_date: string
    miss_distance: {
      lunar: string
      kilometers: string
    }
    relative_velocity: {
      kilometers_per_second: string
    }
  }>
  orbital_data?: {
    orbit_class?: {
      orbit_class_type?: string
    }
  }
}

function getDateRange(): { start: string; end: string } {
  const now = new Date()
  const start = now.toISOString().split('T')[0]
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
  return { start, end }
}

export async function fetchAndProcessAsteroids(): Promise<ProcessedAsteroid[]> {
  const apiKey = process.env.NASA_API_KEY ?? 'DEMO_KEY'
  const { start, end } = getDateRange()

  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${apiKey}`

  let data: Record<string, unknown>
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`NASA API responded with ${res.status}`)
    data = await res.json()
  } catch (err) {
    console.error('NASA NeoWs fetch error:', err)
    return []
  }

  const nearEarthObjects = data.near_earth_objects as Record<string, NasaNeo[]>
  const asteroids: ProcessedAsteroid[] = []
  let idx = 0

  for (const neos of Object.values(nearEarthObjects)) {
    for (const neo of neos) {
      const minM = neo.estimated_diameter.meters.estimated_diameter_min
      const maxM = neo.estimated_diameter.meters.estimated_diameter_max
      const avgM = (minM + maxM) / 2

      const spectralType = getSpectralType(
        neo.name,
        neo.orbital_data?.orbit_class?.orbit_class_type
      )

      const approach = neo.close_approach_data?.[0]
      const closeApproachDate = approach?.close_approach_date ?? 'N/A'
      const missDistanceLunar = parseFloat(approach?.miss_distance?.lunar ?? '0')
      const missDistanceKm = parseFloat(approach?.miss_distance?.kilometers ?? '0')
      const relativeVelocityKmS = parseFloat(
        approach?.relative_velocity?.kilometers_per_second ?? '0'
      )

      const economicValueUsd = calculateEconomicValue(avgM, spectralType, 1.0)

      // Spread asteroids in a band around Earth's orbit (radius 10 scene units)
      // range 6–18 with some vertical scatter
      const orbitRadius = 6 + (idx % 25) * 0.48 + (idx % 7) * 0.2
      const orbitAngle =
        ((idx * 137.5) / 360) * Math.PI * 2 // golden-angle distribution

      asteroids.push({
        id: neo.id,
        name: neo.name,
        spkId: neo.neo_reference_id,
        estimatedDiameterMinM: minM,
        estimatedDiameterMaxM: maxM,
        avgDiameterM: avgM,
        spectralType,
        closeApproachDate,
        missDistanceLunar,
        missDistanceKm,
        relativeVelocityKmS,
        isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
        composition: COMPOSITION_TABLE[spectralType],
        economicValueUsd,
        orbitRadius,
        orbitAngle,
      })

      idx++
    }
  }

  asteroids.sort((a, b) => b.economicValueUsd - a.economicValueUsd)
  return asteroids
}
