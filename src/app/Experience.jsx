import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import TimelineBridge from '../core/timeline/TimelineBridge'
import IntroCube from '../world/introCube/IntroCube'


function Scene() {
  return (
    <>
      <TimelineBridge />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 8]} intensity={1.2} />
      <IntroCube />
    </>
  )
}

export default function Experience() {
  return (
    <div id="webgl-root" className="webgl-layer fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{
          fov: 45,
          near: 0.01,
          far: 500,
          position: [0, 0, 12],
        }}
        shadows
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
