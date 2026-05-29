import { MODES, useExperience } from '../../stores/useExperience'
import { isExplorePhase } from '../phases/phaseConfig'

export function enterExploreMode() {
  const store = useExperience.getState()

  if (!isExplorePhase(store.currentPhase)) return false
  if (!store.canExplore()) return false

  store.setMode(MODES.EXPLORE)
  return true
}

export function exitExploreMode() {
  const store = useExperience.getState()

  if (store.mode !== MODES.EXPLORE) return false

  store.setMode(MODES.IDLE)
  return true
}
