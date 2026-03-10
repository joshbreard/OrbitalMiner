import SceneCanvas from '@/components/SceneCanvas'
import { fetchAndProcessAsteroids } from '@/lib/nasaApi'

export const revalidate = 3600 // revalidate every hour

export default async function Home() {
  const asteroids = await fetchAndProcessAsteroids()

  return (
    <main style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <SceneCanvas asteroids={asteroids} />
    </main>
  )
}
