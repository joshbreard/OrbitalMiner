import { NextResponse } from 'next/server'
import { fetchAndProcessAsteroids } from '@/lib/nasaApi'

export async function GET() {
  try {
    const asteroids = await fetchAndProcessAsteroids()
    return NextResponse.json({ asteroids, fetchedAt: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    )
  }
}
