import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { worldState } from '../../core/world/worldState'
import { useExperience } from '../../stores/useExperience'
import CubeInteractor from './CubeInteractor'
import CubeRays from './CubeRays'
import EdgeParticles from './EdgeParticles'
import InternalDepth from './InternalDepth'
import StructuralLines from './StructuralLines'

export default function IntroCube() {
  const groupRef = useRef(null)
  const currentPhase = useExperience((state) => state.currentPhase)
  const isTransitioning = useExperience((state) => state.isTransitioning)

  useFrame((state) => {
    if (!groupRef.current) return

    const unfoldScale = 1 + worldState.unfold * 0.65
    const scale = worldState.cubeScale * unfoldScale

    groupRef.current.scale.setScalar(scale)
    groupRef.current.rotation.y = worldState.cubeRotation

    if (currentPhase === 0 && !isTransitioning) {
      groupRef.current.rotation.y += state.clock.getDelta() * 0.12
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.08
    }
  })

  return (
    <group ref={groupRef}>
      <CubeInteractor />
      <InternalDepth />
      <CubeRays />
      <StructuralLines />
      <EdgeParticles />
    </group>
  )
}
