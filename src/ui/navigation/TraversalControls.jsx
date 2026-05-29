import { goBack, goDeeper } from '../../core/timeline/cinematicController'
import { enterExploreMode } from '../../core/mode/modeController'
import {
  FIRST_INTERIOR_PHASE,
  MAX_PHASE,
  PHASE_LABELS,
} from '../../core/phases/phaseConfig'
import { useExperience } from '../../stores/useExperience'

export default function TraversalControls() {
  const show = useExperience((state) => state.showTraversalControls())
  const currentPhase = useExperience((state) => state.currentPhase)
  const isTransitioning = useExperience((state) => state.isTransitioning)

  if (!show) return null

  const canGoBack = currentPhase >= FIRST_INTERIOR_PHASE && !isTransitioning
  const canGoDeeper = !isTransitioning
  const isLoopExit = currentPhase >= MAX_PHASE

  return (
    <nav
      aria-label="Dimensional traversal"
      className="pointer-events-auto fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 sm:bottom-8 sm:gap-4 md:bottom-10"
    >
      <button
        type="button"
        disabled={!canGoBack}
        onClick={() => goBack()}
        className="group flex h-12 w-12 items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/10 text-blue-300 backdrop-blur-sm transition enabled:hover:scale-105 enabled:hover:border-blue-300/70 enabled:hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-30 sm:h-14 sm:w-14"
        aria-label="Surface one layer"
      >
        <span className="text-lg font-light sm:text-xl">←</span>
      </button>

      <button
        type="button"
        disabled={isTransitioning}
        onClick={() => enterExploreMode()}
        className="flex h-14 min-w-[9rem] items-center justify-center rounded-full border border-yellow-400/50 bg-yellow-400/10 px-5 text-xs font-medium tracking-[0.2em] text-yellow-200 uppercase backdrop-blur-sm transition hover:scale-105 hover:border-yellow-300/80 hover:bg-yellow-400/20 disabled:cursor-not-allowed disabled:opacity-40 sm:h-16 sm:min-w-[11rem] sm:text-sm"
        aria-label={`Explore ${PHASE_LABELS[currentPhase]}`}
      >
        Explore
      </button>

      <button
        type="button"
        disabled={!canGoDeeper}
        onClick={() => goDeeper()}
        className="group flex h-12 w-12 items-center justify-center rounded-full border border-red-400/40 bg-red-500/10 text-red-300 backdrop-blur-sm transition enabled:hover:scale-105 enabled:hover:border-red-300/70 enabled:hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-30 sm:h-14 sm:w-14"
        aria-label={isLoopExit ? 'Return to landing surface' : 'Dive deeper'}
      >
        <span className="text-lg font-light sm:text-xl">→</span>
      </button>
    </nav>
  )
}
