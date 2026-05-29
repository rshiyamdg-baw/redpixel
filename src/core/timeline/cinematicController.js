import gsap from 'gsap'
import {
  FIRST_INTERIOR_PHASE,
  isLandingSurface,
  MAX_PHASE,
  PHASE_WORLD_CONFIG,
  PHASES,
} from '../phases/phaseConfig'
import { applyWorldConfig } from '../world/worldState'
import { MODES, useExperience } from '../../stores/useExperience'
import { ABOUT_CONFIG, LANDING_CONFIG } from './traversalKeyframes'
import {
  ENTRY_MOTION,
  EXIT_MOTION,
  TRAVERSAL_MOTION,
} from './traversalEasing'
import {
  applyWorldSnapshot,
  blendWorldStates,
  snapshotWorldState,
} from './worldBlend'

let activeTimeline = null

function killActiveTimeline() {
  if (activeTimeline) {
    activeTimeline.kill()
    activeTimeline = null
  }
}

function beginTravel(direction) {
  const store = useExperience.getState()
  store.setTraversalDirection(direction)
  store.setMode(MODES.TRAVEL)
  store.setIsTransitioning(true)
}

function finishAtPhase(targetPhase) {
  const store = useExperience.getState()
  applyWorldConfig(PHASE_WORLD_CONFIG[targetPhase])
  store.setCurrentPhase(targetPhase)
  store.setTargetPhase(targetPhase)
  store.setMode(MODES.IDLE)
  store.setIsTransitioning(false)

  if (isLandingSurface(targetPhase)) {
    store.setHasEntered(false)
  }
}

function animateWorldBlend(from, to, { duration, ease }, onComplete) {
  killActiveTimeline()

  const driver = { t: 0 }

  activeTimeline = gsap.timeline({
    onComplete: () => {
      activeTimeline = null
      applyWorldSnapshot(to)
      onComplete?.()
    },
  })

  activeTimeline.to(driver, {
    t: 1,
    duration,
    ease,
    overwrite: 'auto',
    onUpdate: () => blendWorldStates(from, to, driver.t),
  })

  return activeTimeline
}

function tweenWorldTo(targetConfig, motion, onComplete) {
  const from = snapshotWorldState()
  return animateWorldBlend(from, targetConfig, motion, onComplete)
}

export function playEntryTraversal() {
  const store = useExperience.getState()

  beginTravel(1)
  store.setPreviousPhase(PHASES.LANDING)
  store.setTargetPhase(PHASES.ABOUT)
  killActiveTimeline()

  const from = snapshotWorldState()

  activeTimeline = gsap.timeline({
    onComplete: () => {
      activeTimeline = null
      applyWorldSnapshot(ABOUT_CONFIG)
      store.setHasEntered(true)
      finishAtPhase(PHASES.ABOUT)
    },
  })

  const driver = { t: 0 }

  activeTimeline.to(driver, {
    t: 1,
    duration: ENTRY_MOTION.duration,
    ease: ENTRY_MOTION.ease,
    overwrite: 'auto',
    onUpdate: () => blendWorldStates(from, ABOUT_CONFIG, driver.t),
  })

  return activeTimeline
}

export function transitionToPhase(targetPhase, direction) {
  const store = useExperience.getState()
  const fromPhase = store.currentPhase

  if (fromPhase === targetPhase) return null

  store.setPreviousPhase(fromPhase)
  store.setTargetPhase(targetPhase)
  beginTravel(direction)

  const targetConfig = { ...PHASE_WORLD_CONFIG[targetPhase] }

  if (direction > 0) {
    targetConfig.energy = Math.min(targetConfig.energy + 0.08, 1)
  }

  return tweenWorldTo(targetConfig, TRAVERSAL_MOTION, () => {
    finishAtPhase(targetPhase)
  })
}

function playSurfaceEmerge(onComplete) {
  const from = snapshotWorldState()

  killActiveTimeline()

  activeTimeline = gsap.timeline({
    onComplete: () => {
      activeTimeline = null
      applyWorldSnapshot(LANDING_CONFIG)
      onComplete?.()
    },
  })

  const driver = { t: 0 }

  activeTimeline.to(driver, {
    t: 1,
    duration: EXIT_MOTION.duration,
    ease: EXIT_MOTION.ease,
    overwrite: 'auto',
    onUpdate: () => blendWorldStates(from, LANDING_CONFIG, driver.t),
  })

  return activeTimeline
}

export function surfaceToLanding() {
  const store = useExperience.getState()

  store.setPreviousPhase(store.currentPhase)
  store.setTargetPhase(PHASES.LANDING)
  beginTravel(-1)

  if (store.mode === MODES.EXPLORE) {
    store.setMode(MODES.TRAVEL)
  }

  return playSurfaceEmerge(() => {
    finishAtPhase(PHASES.LANDING)
  })
}

export function completeLoopToLanding() {
  return surfaceToLanding()
}

export function enterFromLanding() {
  const store = useExperience.getState()

  if (
    !isLandingSurface(store.currentPhase) ||
    store.mode !== MODES.IDLE ||
    store.isTransitioning
  ) {
    return null
  }

  return playEntryTraversal()
}

export function goDeeper() {
  const store = useExperience.getState()

  if (!store.canTraverse()) return null

  if (store.currentPhase >= MAX_PHASE) {
    return completeLoopToLanding()
  }

  return transitionToPhase(store.currentPhase + 1, 1)
}

export function goBack() {
  const store = useExperience.getState()

  if (!store.canTraverse()) return null
  if (store.currentPhase <= FIRST_INTERIOR_PHASE) {
    return surfaceToLanding()
  }

  return transitionToPhase(store.currentPhase - 1, -1)
}

export function destroyCinematicController() {
  killActiveTimeline()
}
