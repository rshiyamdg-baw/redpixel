import { worldState } from '../world/worldState'

const NUMERIC_KEYS = [
  'lineDensity',
  'lineWidth',
  'lineColor',
  'tunnelScale',
  'tunnelOpacity',
  'particleEnergy',
  'rayIntensity',
  'unfold',
  'distortion',
  'energy',
  'colorIntensity',
  'cameraZ',
  'cameraY',
  'cameraX',
  'targetX',
  'targetY',
  'targetZ',
  'cubeScale',
  'cubeRotation',
  'fogDensity',
  'shellOpacity',
  'signalReveal',
]

export function snapshotWorldState(source = worldState) {
  const snap = {}
  for (const key of NUMERIC_KEYS) {
    snap[key] = source[key]
  }
  return snap
}

export function blendWorldStates(from, to, t) {
  const clamped = Math.min(Math.max(t, 0), 1)

  for (const key of NUMERIC_KEYS) {
    const a = from[key]
    const b = to[key]
    if (typeof a === 'number' && typeof b === 'number') {
      worldState[key] = a + (b - a) * clamped
    }
  }
}

export function applyWorldSnapshot(config) {
  for (const key of NUMERIC_KEYS) {
    if (typeof config[key] === 'number') {
      worldState[key] = config[key]
    }
  }
}
