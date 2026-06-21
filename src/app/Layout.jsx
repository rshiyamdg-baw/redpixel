import { useEffect } from 'react'
import { destroyCinematicController } from '../core/timeline/cinematicController'
import { initExperience } from '../core/bootstrap/initExperience'
import ExplorePanel from '../ui/sections/ExplorePanel'
import PhaseIndicator from '../ui/overlay/PhaseIndicator'
import TraversalControls from '../ui/navigation/TraversalControls'
import CustomCursor from '../ui/overlay/CustomCursor'
import GuidanceOverlay from '../ui/GuidanceOverlay' 
import LandingFooter from '../ui/LandingFooter'
import ContactPhaseUI from '../ui/phases/ContactPhaseUI'
import WorksPhaseUI from '../ui/phases/WorksPhaseUI'

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
      <CustomCursor />
      <main className="h-full w-full px-4 sm:px-6 md:px-10 lg:px-16">
        {/* GLOBAL NAVIGATION (Always present, handles its own fade states) */}
        <PhaseIndicator />
        <TraversalControls />
        <GuidanceOverlay />
        <LandingFooter />

        {/* DIMENSIONAL EXPLORE UIs (They wait invisibly until their Phase + Mode triggers) */}
        <ExplorePanel />    
        <WorksPhaseUI />    
        <ContactPhaseUI />

      </main>
    </div>
  )
}
