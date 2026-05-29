import { PHASE_WORLD_CONFIG, PHASES } from '../phases/phaseConfig'

function cloneConfig(config) {
  return { ...config }
}

export const worldState = cloneConfig(PHASE_WORLD_CONFIG[PHASES.LANDING])

export function applyWorldConfig(config) {
  Object.assign(worldState, config)
}

export function resetWorldToPhase(phase) {
  applyWorldConfig(PHASE_WORLD_CONFIG[phase])
}
