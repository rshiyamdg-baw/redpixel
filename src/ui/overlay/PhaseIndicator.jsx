import { isLandingSurface, PHASE_LABELS } from '../../core/phases/phaseConfig'
import { useExperience } from '../../stores/useExperience'

export default function PhaseIndicator() {
  const currentPhase = useExperience((state) => state.currentPhase)
  const mode = useExperience((state) => state.mode)
  const isTransitioning = useExperience((state) => state.isTransitioning)

  return (
    <div className="pointer-events-none fixed top-4 left-4 z-20 font-mono text-[10px] tracking-widest text-white/40 uppercase sm:top-6 sm:left-6 sm:text-xs md:top-8 md:left-8">
      <span className="block text-white/70">{PHASE_LABELS[currentPhase]}</span>
      <span className="block text-white/50">{mode}</span>
      {isLandingSurface(currentPhase) && !isTransitioning && (
        <span className="mt-2 block max-w-[12rem] text-[9px] leading-relaxed tracking-[0.25em] text-red-300/70 normal-case sm:text-[10px]">
          Click the cube to enter
        </span>
      )}
      {isTransitioning && (
        <span className="mt-1 block text-yellow-300/60">traversing…</span>
      )}
    </div>
  )
}
