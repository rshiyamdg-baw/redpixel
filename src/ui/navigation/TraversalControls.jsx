import { goBack, goDeeper } from '../../core/timeline/cinematicController'
import { enterExploreMode, exitExploreMode } from '../../core/mode/modeController'
import { FIRST_INTERIOR_PHASE, MAX_PHASE } from '../../core/phases/phaseConfig'
import { useExperience, MODES } from '../../stores/useExperience'

export default function TraversalControls() {
  const show = useExperience((state) => state.showTraversalControls())
  const currentPhase = useExperience((state) => state.currentPhase)
  const isTransitioning = useExperience((state) => state.isTransitioning)
  const mode = useExperience((state) => state.mode)

  if (!show) return null

  const canGoBack = currentPhase >= FIRST_INTERIOR_PHASE && !isTransitioning
  const canGoDeeper = !isTransitioning
  const isExplore = mode === MODES.EXPLORE

  const handleYellowClick = () => {
    if (isExplore) exitExploreMode()
    else enterExploreMode()
  }

  const handleRedClick = () => {
    if (isExplore) exitExploreMode()
    goDeeper()
  }

  const handleBlueClick = () => {
    if (isExplore) exitExploreMode()
    goBack()
  }

  return (
    <nav
      aria-label="Dimensional traversal"
      className="pointer-events-auto fixed bottom-8 left-1/2 z-50 flex h-28 w-36 -translate-x-1/2 items-center justify-center sm:bottom-12"
    >
      {/* YELLOW: Top Center (Explore/Close Toggle) */}
      <button
        type="button"
        disabled={isTransitioning}
        onClick={handleYellowClick}
        className="absolute top-0 flex h-14 w-14 items-center justify-center rounded-full border border-yellow-500/40 bg-black/40 shadow-[0_0_20px_rgba(250,204,21,0.15)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-yellow-400 hover:bg-yellow-500/20 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] disabled:opacity-50"
      >
        {/* An elegant glowing core instead of text */}
        <div className={`h-3 w-3 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,1)] transition-transform duration-300 ${isExplore ? 'scale-50' : 'scale-100'}`} />
      </button>

      {/* BLUE: Bottom Left (Surface/Back) */}
      <button
        type="button"
        disabled={!canGoBack}
        onClick={handleBlueClick}
        className="absolute bottom-0 left-0 flex h-12 w-12 items-center justify-center rounded-full border border-blue-500/40 bg-black/40 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-blue-400 hover:bg-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-30 disabled:hover:scale-100"
      >
        <span className="text-xl font-light">←</span>
      </button>

      {/* RED: Bottom Right (Dive Deeper) */}
      <button
        type="button"
        disabled={!canGoDeeper}
        onClick={handleRedClick}
        className="absolute bottom-0 right-0 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/40 bg-black/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-red-400 hover:bg-red-500/20 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] disabled:opacity-30 disabled:hover:scale-100"
      >
        <span className="text-xl font-light">→</span>
      </button>
    </nav>
  )
}