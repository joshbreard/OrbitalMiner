export type SpectralType = 'M' | 'C' | 'S' | 'unknown'

export interface MineralComposition {
  iron: number          // percentage
  nickel: number        // percentage
  platinum: number      // percentage (platinum-group metals)
  water: number         // percentage
  silicate: number      // percentage
}

export const COMPOSITION_TABLE: Record<SpectralType, MineralComposition> = {
  M: { iron: 89.998, nickel: 10, platinum: 0.002, water: 0, silicate: 0 },
  C: { iron: 10, nickel: 5, platinum: 0, water: 20, silicate: 65 },
  S: { iron: 24.999, nickel: 12, platinum: 0.001, water: 0, silicate: 63 },
  unknown: { iron: 24.999, nickel: 12, platinum: 0.001, water: 0, silicate: 63 },
}

// Commodity prices
// platinum ~$1000/troy oz → convert to per kg: 1 troy oz = 0.0311034 kg → $32,150/kg
// nickel ~$6/lb → $13.23/kg
// iron ~$0.05/lb → $0.11/kg
// water in space ~$30,000/kg
export const COMMODITY_PRICES_PER_KG = {
  platinum: 32150,   // USD/kg
  nickel: 13.23,     // USD/kg
  iron: 0.11,        // USD/kg
  water: 30000,      // USD/kg
  silicate: 0,       // no market value modeled
}

// Asteroid density by type (kg/m³)
export const DENSITY_BY_TYPE: Record<SpectralType, number> = {
  M: 5300,    // metallic, ~iron density
  C: 1500,    // carbonaceous, low density
  S: 2700,    // silicaceous, mid density
  unknown: 2700,
}

export function getSpectralType(name: string, classification?: string): SpectralType {
  const text = `${name} ${classification ?? ''}`.toUpperCase()
  // Simple heuristic: check for known spectral indicators
  if (text.includes('(M)') || text.match(/\bM-TYPE\b/) || text.match(/\bMETAL/)) return 'M'
  if (text.includes('(C)') || text.match(/\bC-TYPE\b/) || text.match(/\bCARBON/)) return 'C'
  if (text.includes('(S)') || text.match(/\bS-TYPE\b/) || text.match(/\bSILIC/)) return 'S'

  // Assign pseudo-random type based on asteroid ID for visual variety
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const types: SpectralType[] = ['S', 'S', 'C', 'C', 'M']
  return types[hash % types.length]
}

export function asteroidMassKg(diameterMeters: number, type: SpectralType): number {
  const radius = diameterMeters / 2
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3)
  return volume * DENSITY_BY_TYPE[type]
}

export function calculateEconomicValue(
  diameterMeters: number,
  type: SpectralType,
  extractionEfficiency = 1.0
): number {
  const massKg = asteroidMassKg(diameterMeters, type)
  const comp = COMPOSITION_TABLE[type]

  const iron = massKg * (comp.iron / 100) * COMMODITY_PRICES_PER_KG.iron
  const nickel = massKg * (comp.nickel / 100) * COMMODITY_PRICES_PER_KG.nickel
  const platinum = massKg * (comp.platinum / 100) * COMMODITY_PRICES_PER_KG.platinum
  const water = massKg * (comp.water / 100) * COMMODITY_PRICES_PER_KG.water

  return (iron + nickel + platinum + water) * extractionEfficiency
}

export function formatValue(usd: number): string {
  if (usd >= 1e18) return `$${(usd / 1e18).toFixed(2)} Qi`  // quintillion
  if (usd >= 1e15) return `$${(usd / 1e15).toFixed(2)} Q`   // quadrillion
  if (usd >= 1e12) return `$${(usd / 1e12).toFixed(2)} T`   // trillion
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)} B`     // billion
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)} M`     // million
  return `$${usd.toLocaleString()}`
}
