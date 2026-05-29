export const PHASES = {
  LANDING: 0,
  ABOUT: 1,
  WORKS: 2,
  CONTACT: 3,
}

export const PHASE_LABELS = ['landing', 'about', 'works', 'contact']

export const MAX_PHASE = PHASES.CONTACT
export const MIN_PHASE = PHASES.LANDING
export const FIRST_INTERIOR_PHASE = PHASES.ABOUT

export function isLandingSurface(phase) {
  return phase === PHASES.LANDING
}

export function isExplorePhase(phase) {
  return phase >= PHASES.ABOUT && phase <= PHASES.CONTACT
}

export const PHASE_WORLD_CONFIG = {
  [PHASES.LANDING]: {
    lineDensity: 0.35,
    lineWidth: 1.5,
    lineColor: 0xff3333,
    tunnelScale: 0,
    tunnelOpacity: 0,
    particleEnergy: 0.2,
    rayIntensity: 0.12,
    unfold: 0,
    distortion: 0.05,
    energy: 0.15,
    colorIntensity: 0.45,
    cameraZ: 12,
    cameraY: 0,
    cameraX: 0,
    cubeScale: 0.55,
    cubeRotation: 0,
    fogDensity: 0.08,
    shellOpacity: 0.55,
    signalReveal: 0,
  },
  [PHASES.ABOUT]: {
    lineDensity: 0.75,
    lineWidth: 2.2,
    lineColor: 0xc084fc,
    tunnelScale: 0.35,
    tunnelOpacity: 0.4,
    particleEnergy: 0.45,
    rayIntensity: 0.5,
    unfold: 0.55,
    distortion: 0.12,
    energy: 0.4,
    colorIntensity: 0.65,
    cameraZ: 2.8,
    cameraY: 0.15,
    cameraX: 0,
    cubeScale: 1.1,
    cubeRotation: 0.4,
    fogDensity: 0.2,
    shellOpacity: 0.75,
    signalReveal: 0.25,
  },
  [PHASES.WORKS]: {
    lineDensity: 1.25,
    lineWidth: 3.2,
    lineColor: 0x4488ff,
    tunnelScale: 0.85,
    tunnelOpacity: 0.75,
    particleEnergy: 0.85,
    rayIntensity: 0.95,
    unfold: 0.9,
    distortion: 0.35,
    energy: 0.95,
    colorIntensity: 0.95,
    cameraZ: 1.15,
    cameraY: 0.35,
    cameraX: 0.1,
    cubeScale: 1.45,
    cubeRotation: 0.85,
    fogDensity: 0.35,
    shellOpacity: 0.9,
    signalReveal: 0.8,
  },
  [PHASES.CONTACT]: {
    lineDensity: 0.55,
    lineWidth: 2,
    lineColor: 0xffcc33,
    tunnelScale: 1,
    tunnelOpacity: 0.85,
    particleEnergy: 0.4,
    rayIntensity: 0.45,
    unfold: 1,
    distortion: 0.2,
    energy: 0.45,
    colorIntensity: 0.55,
    cameraZ: 0.32,
    cameraY: 0,
    cameraX: 0,
    cubeScale: 1.7,
    cubeRotation: 0.2,
    fogDensity: 0.55,
    shellOpacity: 0.85,
    signalReveal: 0.65,
  },
}
