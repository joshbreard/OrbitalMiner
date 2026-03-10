import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OrbitalMiner — Asteroid Economic Value Tracker',
  description: 'Interactive 3D near-Earth asteroid economic value tracker powered by NASA NeoWs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
