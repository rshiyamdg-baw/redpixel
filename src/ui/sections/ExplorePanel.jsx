import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { PHASE_LABELS } from '../../core/phases/phaseConfig'
import { MODES, useExperience } from '../../stores/useExperience'
import { PhaseAbout, PHASE_CONTENT } from './PhaseComponents'

const useScrambleText = (text, trigger) => {
  const [display, setDisplay] = useState(text ? text.replace(/./g, '\u00A0') : '')
  useEffect(() => {
    if (!trigger || !text) return;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>'
    let iteration = 0, animFrame = null
    setDisplay(text.split('').map(char => char === ' ' ? ' ' : letters[Math.floor(Math.random() * letters.length)]).join(''))

    const scramble = () => {
      setDisplay(text.split('').map((char, i) => i < iteration || char === ' ' ? char : letters[Math.floor(Math.random() * letters.length)]).join(''))
      if (iteration < text.length) {
        iteration += 1 / 3 
        animFrame = requestAnimationFrame(scramble)
      }
    }
    const timeout = setTimeout(() => { animFrame = requestAnimationFrame(scramble) }, 600)
    return () => { cancelAnimationFrame(animFrame); clearTimeout(timeout) }
  }, [text, trigger])
  return display
}

export default function ExplorePanel() {
  const mode = useExperience((state) => state.mode)
  const currentPhase = useExperience((state) => state.currentPhase)

  const containerRef = useRef(null)
  const bgRef = useRef(null) 
  const dotRef = useRef(null)
  const svgPathRef = useRef(null)
  const targetLineRef = useRef(null) 
  
  const randRatios = useRef({ r1: 0.3, r2: 0.5, r3: 0.6 })

  const prevPhaseRef = useRef(currentPhase)
  const isTargetPhase = currentPhase === 1 || currentPhase === 4;
  const displayPhase = isTargetPhase ? currentPhase : prevPhaseRef.current;
  if (isTargetPhase) prevPhaseRef.current = displayPhase;

  const isVisible = mode === MODES.EXPLORE && isTargetPhase;
  const scrambledTitle = useScrambleText(PHASE_CONTENT[displayPhase]?.title || '', isVisible)

  const accentColorClass = "bg-red-600";
  const textAccentClass = "text-red-400";
  const svgStroke = "#dc2626"; 

  const recalculatePath = () => {
    if (!targetLineRef.current || !svgPathRef.current) return 0;
    const rect = targetLineRef.current.getBoundingClientRect()
    const startX = window.innerWidth / 2, startY = window.innerHeight / 2
    const endX = rect.left, endY = rect.top + rect.height / 2
    
    let newPath = '';
    if (window.innerWidth < 640) {
        newPath = `M ${startX} ${startY} L ${endX} ${endY}`
    } else {
        const { r1, r2, r3 } = randRatios.current
        const p1X = startX + (endX - startX) * r1, p1Y = startY
        const p2X = p1X, p2Y = startY + (endY - startY) * r2
        const p3X = p2X + (endX - p2X) * r3, p3Y = p2Y
        const p4X = p3X, p4Y = endY
        newPath = `M ${startX} ${startY} L ${p1X} ${p1Y} L ${p2X} ${p2Y} L ${p3X} ${p3Y} L ${p4X} ${p4Y} L ${endX} ${endY}`
    }

    svgPathRef.current.setAttribute('d', newPath)
    const length = svgPathRef.current.getTotalLength() || 1500;
    gsap.set(svgPathRef.current, { strokeDasharray: length })
    return length;
  }

  useEffect(() => {
    const handleResize = () => { if (isVisible) recalculatePath() }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isVisible])

  useEffect(() => {
    if (!containerRef.current || !bgRef.current || !svgPathRef.current || !dotRef.current) return
    
    const reveals = containerRef.current.querySelectorAll('.ui-reveal')
    const techLines = containerRef.current.querySelectorAll('.tech-line')
    const skillFills = containerRef.current.querySelectorAll('.skill-fill')
    const langDots = containerRef.current.querySelectorAll('.lang-dot')
    const expNodes = containerRef.current.querySelectorAll('.exp-node')
    const mainWrapper = containerRef.current;

    gsap.killTweensOf([reveals, techLines, skillFills, langDots, expNodes, bgRef.current, svgPathRef.current, dotRef.current, mainWrapper])

    if (isVisible) {
      randRatios.current = { r1: 0.1 + Math.random() * 0.4, r2: 0.2 + Math.random() * 0.6, r3: 0.4 + Math.random() * 0.4 }
      gsap.set(mainWrapper, { autoAlpha: 1 })

      const pathLen = recalculatePath();

      gsap.set(svgPathRef.current, { strokeDashoffset: pathLen })
      gsap.set(reveals, { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)', x: 20 })
      gsap.set(techLines, { scaleX: 0, scaleY: 0, opacity: 0 })
      gsap.set(bgRef.current, { clipPath: 'inset(0% 100% 0% 0%)' }) 
      gsap.set(dotRef.current, { scale: 0, opacity: 0 })
      gsap.set(skillFills, { scaleX: 0 })
      gsap.set(langDots, { opacity: 0, scale: 0 })
      gsap.set(expNodes, { opacity: 0, x: -10 })
      
      const tl = gsap.timeline({ delay: 0.1 })
      tl.to(dotRef.current, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' })
        .to(svgPathRef.current, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' })
        .to(bgRef.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out' }, "-=0.2")
        .to(techLines, { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power3.out' }, "-=0.4")
        .to(reveals, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }, "-=0.3")
        .to(skillFills, { scaleX: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, "-=0.2")
        .to(langDots, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.03, ease: 'back.out(2)' }, "-=0.6")
        .to(expNodes, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, "-=0.5")

    } else {
      const pathLen = svgPathRef.current?.getTotalLength() || 1500;

      gsap.to(reveals, { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)', x: 10, duration: 0.3, ease: 'power2.in' })
      gsap.to(techLines, { opacity: 0, scaleX: 0, scaleY: 0, duration: 0.3, ease: 'power2.in' })
      gsap.to(skillFills, { scaleX: 0, duration: 0.2, ease: 'power2.in' })
      gsap.to(langDots, { opacity: 0, scale: 0, duration: 0.2, ease: 'power2.in' })
      gsap.to(expNodes, { opacity: 0, x: -10, duration: 0.2, ease: 'power2.in' })

      gsap.to(bgRef.current, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.4, ease: 'power2.inOut' })
      gsap.to(svgPathRef.current, { strokeDashoffset: pathLen, duration: 0.4, ease: 'power2.inOut' })
      gsap.to(dotRef.current, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' })
      
      gsap.to(mainWrapper, { autoAlpha: 0, duration: 0.1, delay: 0.4 })
    }
  }, [isVisible]) 

  return (
    // THE FOUC FIX: Explicitly hidden on mount!
    <div ref={containerRef} style={{ opacity: 0, visibility: 'hidden' }}>
      <div ref={dotRef} className="fixed top-1/2 left-1/2 z-[50] -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none">
        <div className={`w-3 h-3 ${accentColorClass} shadow-[0_0_20px_currentColor]`} />
        <div className={`absolute inset-0 border border-current ${textAccentClass} animate-ping opacity-70`} />
      </div>

      <div className="fixed top-0 bottom-40 sm:bottom-0 left-0 right-0 z-[30] flex items-center justify-center sm:justify-end px-4 sm:px-6 sm:pr-[10%] pt-10 sm:pt-0 pointer-events-none">
          <div ref={bgRef} className="w-full max-w-lg h-[75vh] sm:h-[80vh] relative pointer-events-auto border-l border-t border-red-500/50 bg-black/85" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
              <div className="absolute inset-0 backdrop-blur-xl overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff003310_1px,transparent_1px),linear-gradient(to_bottom,#ff003310_1px,transparent_1px)] bg-[size:2rem_2rem] mix-blend-screen opacity-50" />
                  {displayPhase === 1 && (
                      <div className="absolute inset-0 opacity-20 bg-[url('/images/me.jpg')] bg-cover bg-left mix-blend-screen mask-image:linear-gradient(to_right,black,transparent)" />
                  )}
              </div>
          </div>
      </div>

      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[60]">
        <path ref={svgPathRef} fill="none" stroke={svgStroke} strokeWidth="1.5" strokeLinejoin="miter" style={{ filter: `drop-shadow(0px 0px 5px ${svgStroke})` }} />
      </svg>

      <section className="fixed top-0 bottom-40 sm:bottom-0 left-0 right-0 z-[50] flex items-center justify-center sm:justify-end px-4 sm:px-6 sm:pr-[10%] pt-10 sm:pt-0 pointer-events-none">
        
        <div className="w-full max-w-lg max-h-full flex flex-col text-left relative">
          
          <div className={`tech-line origin-left absolute -top-4 sm:-top-10 -right-2 sm:-right-4 w-12 h-[1px] ${accentColorClass} opacity-0 hidden sm:block`} />
          <div className={`tech-line origin-top absolute -top-4 sm:-top-10 -right-2 sm:-right-4 w-[1px] h-12 ${accentColorClass} opacity-0 hidden sm:block`} />
          <div className={`tech-line origin-bottom absolute -bottom-4 sm:-bottom-10 -left-2 sm:-left-4 w-12 h-[1px] ${accentColorClass} opacity-0 hidden sm:block`} />
          <div className={`tech-line origin-bottom absolute -bottom-4 sm:-bottom-10 -left-2 sm:-left-4 w-[1px] h-12 ${accentColorClass} opacity-0 hidden sm:block`} />

          <div className="shrink-0 pt-4 sm:pt-0">
              <div className="flex items-center gap-4 mb-4 ui-reveal opacity-0" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
                <div ref={targetLineRef} className={`h-2 w-2 ${accentColorClass} shadow-[0_0_10px_currentColor]`} />
                <p className={`font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase ${textAccentClass}`}>
                  Extracting Node — {PHASE_LABELS[displayPhase] || ''}
                </p>
              </div>
              
              <h2 className="mb-2 font-mono text-3xl sm:text-5xl lg:text-6xl font-bold text-white ui-reveal opacity-0 drop-shadow-[0_0_15px_rgba(255,0,51,0.5)] min-h-[1.5em]" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
                {scrambledTitle}
              </h2>

              <p className="ui-reveal opacity-0 text-[8px] sm:text-[10px] tracking-widest text-white/50 font-mono mb-4 sm:mb-6 pb-2 sm:pb-4 border-b border-white/10" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
                  {PHASE_CONTENT[displayPhase]?.desc}
              </p>
          </div>

          <div className={`flex-1 overflow-y-auto pb-8 pr-2 overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:transparent ${isVisible ? 'pointer-events-auto' : ''}`}>
             <div className="min-h-[250px]">
                 {displayPhase === 1 && <PhaseAbout />} 
             </div>
          </div>
        </div>
      </section>
    </div>
  )
}