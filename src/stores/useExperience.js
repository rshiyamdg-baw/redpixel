import { create } from 'zustand'
import {
  isExplorePhase,
  isLandingSurface,
  PHASE_LABELS,
} from '../core/phases/phaseConfig'

export const MODES = {
  IDLE: 'idle',
  TRAVEL: 'travel',
  EXPLORE: 'explore',
}

export const useExperience = create((set, get) => ({
  currentPhase: 0,
  targetPhase: 0,
  previousPhase: 0,
  mode: MODES.IDLE,
  traversalDirection: 0,
  hasEntered: false,
  isTransitioning: false,
  quality: 'high',
  isMobile: false,
  activeProject: null,
  activeSignal: null,

  setCurrentPhase: (currentPhase) => set({ currentPhase }),
  setTargetPhase: (targetPhase) => set({ targetPhase }),
  setPreviousPhase: (previousPhase) => set({ previousPhase }),
  setMode: (mode) => set({ mode }),
  setTraversalDirection: (traversalDirection) => set({ traversalDirection }),
  setHasEntered: (hasEntered) => set({ hasEntered }),
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
  setQuality: (quality) => set({ quality }),
  setIsMobile: (isMobile) => set({ isMobile }),
  setActiveProject: (activeProject) => set({ activeProject }),
  setActiveSignal: (activeSignal) => set({ activeSignal }),

  getPhaseLabel: () => PHASE_LABELS[get().currentPhase] ?? 'unknown',

  canTraverse: () => {
    const { mode, isTransitioning, currentPhase } = get()
    if (mode !== MODES.IDLE || isTransitioning) return false
    return isExplorePhase(currentPhase)
  },

  canExplore: () => {
    const { mode, isTransitioning, currentPhase } = get()
    if (mode !== MODES.IDLE || isTransitioning) return false
    return isExplorePhase(currentPhase)
  },

  showTraversalControls: () => {
    const { isTransitioning, currentPhase } = get()
    if (isTransitioning) return false
    return isExplorePhase(currentPhase)
  },
}))
