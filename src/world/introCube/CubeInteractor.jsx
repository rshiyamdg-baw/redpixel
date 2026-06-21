import { useEffect } from 'react'
import { useExperience } from '../../stores/useExperience'
import { enterFromLanding } from '../../core/timeline/cinematicController'
import { isLandingSurface } from '../../core/phases/phaseConfig'
import { DoubleSide } from 'three'

export default function CubeInteractor({ onHoverChange, onPump }) {
  const currentPhase = useExperience((state) => state.currentPhase)
  const isTransitioning = useExperience((state) => state.isTransitioning)

  const isClickable = !isTransitioning

  useEffect(() => {
    if (!isClickable && onHoverChange) {
      setTimeout(() => onHoverChange(false), 0)
    }
  }, [isClickable, onHoverChange])

  if (!isClickable) return null

  return (
    <mesh
      castShadow={false}    // THE FIX: Do not cast the phantom brick shadow!
      receiveShadow={false} // THE FIX: Do not catch shadows!
      onPointerDown={(event) => {
        event.stopPropagation()
        if (onPump) onPump(event.point) 
      }}
      onClick={(event) => {
        event.stopPropagation()
        if (isLandingSurface(currentPhase)) enterFromLanding()
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
      {/* colorWrite={false} is an ultimate optimization: the GPU won't even try to paint it! */}
      <meshBasicMaterial 
        transparent 
        opacity={0} 
        depthWrite={false} 
        colorWrite={false} 
        side={DoubleSide} 
      />
    </mesh>
  )
}