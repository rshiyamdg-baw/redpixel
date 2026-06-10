import { useExperience } from '../stores/useExperience'

export default function LandingFooter() {
  const currentPhase = useExperience((state) => state.currentPhase)
  const isLanding = currentPhase === 0

  return (
    <footer 
      className={`fixed bottom-0 left-0 right-0 w-full px-6 py-6 flex justify-between items-end z-40 pointer-events-none transition-all duration-1000 ease-in-out
      ${isLanding ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      {/* LEFT: Logo / Brand */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 shadow-[0_0_10px_#ff0033]" />
            <h1 className="font-mono text-xl font-bold tracking-widest text-white">REDPIXEL</h1>
        </div>
        <p className="font-mono text-[9px] tracking-[0.3em] text-white/50 uppercase ml-6">
          Interactive Architect
        </p>
      </div>

      {/* RIGHT: Copyright / Status */}
      <div className="text-right">
        <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
          SYS.ONLINE // {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}