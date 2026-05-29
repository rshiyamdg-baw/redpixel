import { useEffect } from 'react'
import { destroyCinematicController } from '../core/timeline/cinematicController'
import { initExperience } from '../core/bootstrap/initExperience'
import ExplorePanel from '../ui/sections/ExplorePanel'
import PhaseIndicator from '../ui/overlay/PhaseIndicator'
import TraversalControls from '../ui/navigation/TraversalControls'

export default function Layout() {
  useEffect(() => {
    initExperience()

    return () => {
      destroyCinematicController()
    }
  }, [])

  return (
    <div
      id="dom-root"
      className="pointer-events-none fixed inset-0 z-10"
    >
      <main className="h-full w-full px-4 sm:px-6 md:px-10 lg:px-16">
        <PhaseIndicator />
        <TraversalControls />
        <ExplorePanel />
      </main>
    </div>
  )
}
