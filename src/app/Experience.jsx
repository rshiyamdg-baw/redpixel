import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useExperience } from '../stores/useExperience'
import TimelineBridge from '../core/timeline/TimelineBridge'
import IntroCube from '../world/introCube/IntroCube'

function Scene() {
  return (
    <>
      <TimelineBridge />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 8, 8]} intensity={1.2} />
      <IntroCube />
    </>
  )
}

export default function Experience() {
  // Grab the detection result from the store
  const isLowEnd = useExperience((state) => state.isLowEnd)

  return (
    <div id="webgl-root" className="webgl-layer fixed inset-0 z-0">
      <Canvas
        // THE CRITICAL CLAMP: 
        // If it's a weak device, lock it to 1x resolution. 
        // If it's a strong device, allow up to 2x resolution.
        dpr={isLowEnd ? 1 : [1, 2]}
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