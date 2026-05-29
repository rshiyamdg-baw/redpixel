import { resetWorldToPhase, worldState } from '../world/worldState'
import { PHASES } from '../phases/phaseConfig'
import { useExperience } from '../../stores/useExperience'

export function initExperience() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches

  resetWorldToPhase(PHASES.LANDING)

  useExperience.setState({
    currentPhase: PHASES.LANDING,
    targetPhase: PHASES.LANDING,
    previousPhase: PHASES.LANDING,
    mode: 'idle',
    traversalDirection: 0,
    hasEntered: false,
    isTransitioning: false,
    isMobile,
    quality: isMobile ? 'medium' : 'high',
  })

  return worldState
}
