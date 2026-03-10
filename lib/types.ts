import type { SpectralType, MineralComposition } from './composition'

export interface ProcessedAsteroid {
  id: string
  name: string
  spkId: string
  estimatedDiameterMinM: number
  estimatedDiameterMaxM: number
  avgDiameterM: number
  spectralType: SpectralType
  closeApproachDate: string
  missDistanceLunar: number
  missDistanceKm: number
  relativeVelocityKmS: number
  isPotentiallyHazardous: boolean
  composition: MineralComposition
  economicValueUsd: number
  // 3D position (AU-ish scale, mapped for scene)
  orbitRadius: number
  orbitAngle: number
}
