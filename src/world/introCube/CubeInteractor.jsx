import { useEffect } from 'react'
import { useExperience } from '../../stores/useExperience'
import { enterFromLanding } from '../../core/timeline/cinematicController'
import { isLandingSurface } from '../../core/phases/phaseConfig'
import { DoubleSide } from 'three'

export default function CubeInteractor({ onHoverChange, onPump }) {
  const currentPhase = useExperience((state) => state.currentPhase)
  const isTransitioning = useExperience((state) => state.isTransitioning)

  const isClickable = !isTransitioning

  // THE FIX: SetTimeout guarantees this fires OUTSIDE the React Render Phase!
  useEffect(() => {
    if (!isClickable && onHoverChange) {
      setTimeout(() => onHoverChange(false), 0)
    }
  }, [isClickable, onHoverChange])

  // If the cube is locked, do not render the raycast box
  if (!isClickable) return null

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
      onPointerOver={(e) => {
        e.stopPropagation()
        if (onHoverChange) onHoverChange(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        if (onHoverChange) onHoverChange(false)
      }}
    >
      <boxGeometry args={[2.4, 2.4, 2.4]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={DoubleSide} />
    </mesh>
  )
}