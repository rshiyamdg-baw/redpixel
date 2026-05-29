import { useEffect } from 'react'
import { exitExploreMode } from '../../core/mode/modeController'
import { isExplorePhase, PHASE_LABELS } from '../../core/phases/phaseConfig'
import { MODES, useExperience } from '../../stores/useExperience'

const PHASE_CONTENT = {
  1: {
    title: 'About',
    body: 'Studio philosophy, biography structures, and the systems behind the work. This layer will hold your story as floating architectural data.',
  },
  2: {
    title: 'Works',
    body: 'Project nodes, holographic previews, and interactive showcases. Each work becomes a portal inside the dimensional shell.',
  },
  3: {
    title: 'Contact',
    body: 'Communication systems, social links, and a commission terminal. A focused signal core for reaching the studio.',
  },
}

export default function ExplorePanel() {
  const mode = useExperience((state) => state.mode)
  const currentPhase = useExperience((state) => state.currentPhase)

  const content = isExplorePhase(currentPhase)
    ? PHASE_CONTENT[currentPhase]
    : null

  useEffect(() => {
    if (mode === MODES.EXPLORE && !content) {
      exitExploreMode()
    }
  }, [mode, content])

  if (mode !== MODES.EXPLORE || !content) return null

  return (
    <section
      aria-label={`${content.title} explore mode`}
      className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-4 backdrop-blur-md sm:px-6 md:px-10"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black/70 p-6 shadow-2xl sm:p-8 md:p-10">
        <p className="mb-2 font-mono text-[10px] tracking-[0.35em] text-yellow-300/70 uppercase sm:text-xs">
          Revealed Mode — {PHASE_LABELS[currentPhase]}
        </p>
        <h2 className="mb-4 text-2xl font-medium text-white sm:text-3xl md:text-4xl">
          {content.title}
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-white/65 sm:text-base">
          {content.body}
        </p>
        <button
          type="button"
          onClick={() => exitExploreMode()}
          className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs tracking-[0.2em] text-white/80 uppercase transition hover:border-white/40 hover:bg-white/10 sm:text-sm"
        >
          Close — Return to Traversal
        </button>
      </div>
    </section>
  )
}
