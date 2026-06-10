import { useExperience } from '../../stores/useExperience'
import { enterFromLanding } from '../../core/timeline/cinematicController'
import { isLandingSurface } from '../../core/phases/phaseConfig'
import { DoubleSide } from 'three'

export default function CubeInteractor({ onHoverChange, onPump }) {
  const currentPhase = useExperience((state) => state.currentPhase)
  const isTransitioning = useExperience((state) => state.isTransitioning)

  const isClickable = !isTransitioning

  if (!isClickable) {
    if (onHoverChange) onHoverChange(false)
    return null
  }

  return (
    <mesh
      onPointerDown={(event) => {
        event.stopPropagation()
        if (onPump) onPump(event.point) 
      }}
      onClick={(event) => {
        event.stopPropagation()
        if (isLandingSurface(currentPhase)) {
           enterFromLanding()
        }
        if (onHoverChange) onHoverChange(false)
      }}
      onPointerOver={() => {
        if (onHoverChange) onHoverChange(true)
      }}
      onPointerOut={() => {
        if (onHoverChange) onHoverChange(false)
      }}
    >
      {/* THE FIX: A Box strictly larger than the Glass Shell (2.4 > 2.0). 
          This intercepts the mouse before the glass can block it! */}
      <boxGeometry args={[2.4, 2.4, 2.4]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={DoubleSide} />
    </mesh>
  )
}