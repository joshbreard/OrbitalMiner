export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: '#00e5ff',
          letterSpacing: '-0.02em',
        }}
      >
        ◈ ORBITALMINER
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
        Scanning near-Earth objects…
      </div>
      <div
        style={{
          width: 200,
          height: 2,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 1,
          overflow: 'hidden',
          marginTop: 8,
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
            animation: 'scan 1.5s infinite',
            width: '60%',
          }}
        />
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(300%) }
        }
      `}</style>
    </div>
  )
}
