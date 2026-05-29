import { useExperience } from '../../stores/useExperience'
import { enterFromLanding } from '../../core/timeline/cinematicController'
import { isLandingSurface } from '../../core/phases/phaseConfig'

export default function CubeInteractor() {
  const currentPhase = useExperience((state) => state.currentPhase)
  const mode = useExperience((state) => state.mode)
  const isTransitioning = useExperience((state) => state.isTransitioning)

  const isClickable =
    isLandingSurface(currentPhase) && mode === 'idle' && !isTransitioning

  if (!isClickable) return null

  return (
    <mesh
      onClick={(event) => {
        event.stopPropagation()
        enterFromLanding()
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      <sphereGeometry args={[1.4, 24, 24]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}
