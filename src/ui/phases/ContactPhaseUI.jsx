import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useExperience, MODES } from '../../stores/useExperience'

export default function ContactPhaseUI() {
  const currentPhase = useExperience((state) => state.currentPhase)
  const mode = useExperience((state) => state.mode)
  
  const isExplore = mode === MODES.EXPLORE && currentPhase === 3
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const mainWrapper = containerRef.current
    const formPanel = mainWrapper.querySelector('.form-panel')
    const items = mainWrapper.querySelectorAll('.anim-item')
    
    gsap.killTweensOf([mainWrapper, formPanel, items])

    if (isExplore) {
      gsap.set(mainWrapper, { autoAlpha: 1 })
      gsap.set(formPanel, { y: 50, opacity: 0, scale: 0.95 })
      gsap.set(items, { y: 20, opacity: 0 })
      
      gsap.to(formPanel, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' })
      gsap.to(items, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 })
    } else {
      gsap.to(formPanel, { y: 30, opacity: 0, scale: 0.95, duration: 0.4, ease: 'power2.in' })
      gsap.to(mainWrapper, { autoAlpha: 0, duration: 0.4, delay: 0.1 })
    }
  }, [isExplore])

  return (
    <div ref={containerRef} className="invisible opacity-0 pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-6 pb-[180px]">
      
      <div className="form-panel pointer-events-auto relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-t-[180px] rounded-b-2xl border border-red-500/30 bg-red-950/10 px-8 pb-14 pt-24 backdrop-blur-2xl shadow-[0_0_60px_rgba(220,38,38,0.15)] sm:px-14">
        
        <div className="absolute left-1/2 top-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-red-500/20 bg-black/40">
            <div className="h-2 w-2 rotate-45 border border-red-500 bg-red-600/20 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
        </div>
        
        <h2 className="anim-item mt-4 mb-2 text-3xl font-light tracking-[0.25em] text-white">INITIATE</h2>
        <p className="anim-item mb-12 text-center text-[9px] font-light tracking-[0.3em] text-red-400/80 uppercase">
          Establish a secure connection
        </p>

        <form className="flex w-full flex-col gap-10" onSubmit={(e) => e.preventDefault()}>
          <div className="anim-item relative group">
            <input 
              type="text" 
              placeholder="YOUR DESIGNATION" 
              className="peer w-full border-b border-red-900/50 bg-transparent pb-3 text-xs tracking-[0.3em] text-white placeholder-red-900/80 outline-none transition-colors focus:border-transparent" 
            />
            <div className="absolute bottom-0 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-red-500 transition-all duration-500 peer-focus:w-full" />
          </div>

          <div className="anim-item relative group">
            <input 
              type="email" 
              placeholder="SECURE FREQUENCY" 
              className="peer w-full border-b border-red-900/50 bg-transparent pb-3 text-xs tracking-[0.3em] text-white placeholder-red-900/80 outline-none transition-colors focus:border-transparent" 
            />
            <div className="absolute bottom-0 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-red-500 transition-all duration-500 peer-focus:w-full" />
          </div>

          <div className="anim-item relative group">
            <textarea 
              rows="3"
              placeholder="TRANSMIT DIRECTIVE..." 
              className="peer w-full resize-none border-b border-red-900/50 bg-transparent pb-3 text-xs tracking-[0.3em] text-white placeholder-red-900/80 outline-none transition-colors focus:border-transparent" 
            />
            <div className="absolute bottom-0 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-red-500 transition-all duration-500 peer-focus:w-full" />
          </div>

          {/* ========================================================= */}
          {/* THE KHATAM CARTOUCHE BUTTON: Persian Art in Contact UI      */}
          {/* ========================================================= */}
          <button 
            className="anim-item group relative mt-6 flex w-full items-center justify-center overflow-hidden bg-black/40 py-5 text-[10px] tracking-[0.4em] text-red-200 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
            style={{ clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)' }}
          >
            {/* Outer Resting Border */}
            <div className="absolute inset-0 border border-red-500/30 transition-colors duration-500 group-hover:border-transparent" style={{ clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)' }} />
            
            {/* Inner Illuminated Hover Border (Tazhib) */}
            <div className="absolute inset-[3px] scale-110 border border-red-500/80 opacity-0 shadow-[inset_0_0_20px_rgba(220,38,38,0.5)] transition-all duration-500 group-hover:scale-100 group-hover:opacity-100" style={{ clipPath: 'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)' }} />

            {/* Sweeping Ruby Silk Fill */}
            <div className="absolute inset-0 -translate-x-full bg-red-900/60 transition-transform duration-700 ease-out group-hover:translate-x-0" />

            <span className="relative z-10 flex items-center gap-6 font-bold transition-colors duration-300 group-hover:text-white">
               TRANSMIT
               
               {/* The Blooming Shamseh Animation */}
               <div className="relative flex h-4 w-4 items-center justify-center">
                  <div className="absolute h-1.5 w-1.5 rotate-45 bg-red-500 transition-all duration-500 group-hover:scale-0 group-hover:opacity-0" />
                  <div className="absolute flex scale-0 items-center justify-center opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:rotate-[225deg] group-hover:opacity-100">
                    <div className="absolute h-4 w-4 border border-red-500 opacity-80" />
                    <div className="absolute h-4 w-4 rotate-45 border border-red-500 opacity-80" />
                    <div className="h-1.5 w-1.5 bg-white shadow-[0_0_15px_rgba(255,255,255,1)]" />
                  </div>
               </div>
            </span>
          </button>
        </form>

      </div>
    </div>
  )
}