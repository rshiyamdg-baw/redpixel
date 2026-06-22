import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useExperience, MODES } from '../../stores/useExperience'

// const RotatingPixel = ({ colorClass }) => (
//   <div className={`absolute right-5 top-1/2 -translate-y-1/2 h-2 w-2 border opacity-0 transition-all duration-700 group-hover/btn:opacity-100 group-hover/btn:rotate-[225deg] shadow-[0_0_15px_rgba(0,0,0,0)] ${colorClass}`} />
// )

const PROJECTS = [
  {
    id: 1,
    title: "AlphaTradeZone",
    category: "Front-End Engineering",
    image: "/images/project1.jpg", 
    description: "A high-performance landing page engineered for a premier trading signal service. Built purely with React, Tailwind, and strict GSAP sequencing to deliver a buttery-smooth, premium DOM experience without relying on WebGL",
    link: "#",
    theme: {
      border: "border-cyan-500/40",
      borderBright: "border-cyan-500/80",
      borderSolid: "border-cyan-500",
      bg: "bg-cyan-900/10",
      bgSweep: "bg-cyan-900/60",
      bgDark: "bg-cyan-900/80",
      bgSolid: "bg-cyan-500",
      lineStroke: "#22d3ee",
      text: "text-cyan-200",
      accent: "text-cyan-400",
      hoverBox: "hover:bg-cyan-900/30 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)]",
      pixel: "border-cyan-400 group-hover/btn:bg-cyan-400 group-hover/btn:shadow-[0_0_15px_rgba(6,182,212,1)]",
      glow: "rgba(34, 211, 238, 0.9)" 
    }
  },
  {
    id: 2,
    title: "Web Experience",
    category: "3D Architecture",
    image: "/images/project2.jpg",
    description: "An immersive 3D web portfolio built for an architect. I handled the entire pipeline: transforming raw CAD files into optimized models, orchestrating the rendering, and building a responsive, state-driven world using React Three Fiber, GSAP, and Zustand.",
    link: "#",
    theme: {
      border: "border-red-500/40",
      borderBright: "border-red-500/80",
      borderSolid: "border-red-500",
      bg: "bg-red-900/10",
      bgSweep: "bg-red-900/60",
      bgDark: "bg-red-900/80",
      bgSolid: "bg-red-500",
      lineStroke: "#ef4444",
      text: "text-red-100",
      accent: "text-red-500",
      hoverBox: "hover:bg-red-900/30 hover:shadow-[0_20px_50px_rgba(220,38,38,0.15)]",
      pixel: "border-red-500 group-hover/btn:bg-red-500 group-hover/btn:shadow-[0_0_15px_rgba(220,38,38,1)]",
      glow: "rgba(239, 68, 68, 0.9)" 
    }
  },
  {
    id: 3,
    title: "High Voltage & Altitude",
    category: "Physical Engineering",
    image: "/images/project3.jpg",
    description: "Not a web application, but a testament to physical hardware and raw electricity. From scaling massive radio towers in biting winds to engineering complex electrical systems in luxury smart homes, my foundation is built on real-world problem-solving and an absolute lack of vertigo.",
    link: "#",
    theme: {
      border: "border-amber-500/40",
      borderBright: "border-amber-500/80",
      borderSolid: "border-amber-500",
      bg: "bg-amber-900/10",
      bgSweep: "bg-amber-900/60",
      bgDark: "bg-amber-900/80",
      bgSolid: "bg-amber-500",
      lineStroke: "#fbbf24",
      text: "text-amber-100",
      accent: "text-amber-500",
      hoverBox: "hover:bg-amber-900/30 hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)]",
      pixel: "border-amber-400 group-hover/btn:bg-amber-400 group-hover/btn:shadow-[0_0_15px_rgba(245,158,11,1)]",
      glow: "rgba(251, 191, 36, 0.9)" 
    }
  }
]

export default function WorksPhaseUI() {
  const currentPhase = useExperience((state) => state.currentPhase)
  const mode = useExperience((state) => state.mode)
  
  const isExplore = mode === MODES.EXPLORE && currentPhase === 2
  const containerRef = useRef(null)
  
  const [expandedId, setExpandedId] = useState(null)
  const prevExplore = useRef(isExplore)

  const centerRefs = useRef([])
  const targetRefs = useRef([])
  const pathRefs = useRef([])
  const pathLengths = useRef([])
  const cardRefs = useRef([]) 
  const shapeRefs = useRef([]) 

  // EDGE GLOW TRACKER
  useEffect(() => {
    if (!isExplore) return;
    const handleGlobalMove = (e) => {
      cardRefs.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
      shapeRefs.current.forEach((shape) => {
        if (!shape) return;
        const rect = shape.getBoundingClientRect();
        shape.style.setProperty('--shape-mouse-x', `${e.clientX - rect.left}px`);
        shape.style.setProperty('--shape-mouse-y', `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener('mousemove', handleGlobalMove);
    return () => window.removeEventListener('mousemove', handleGlobalMove);
  }, [isExplore]);

  // THE 90-DEGREE CIRCUIT BOARD MATH
  const recalculatePaths = () => {
    if (!pathRefs.current.length || !targetRefs.current.length || !centerRefs.current.length) return;

    targetRefs.current.forEach((target, i) => {
      const startEl = centerRefs.current[i];
      const pathEl = pathRefs.current[i];
      if (!target || !startEl || !pathEl) return;

      const startRect = startEl.getBoundingClientRect();
      const endRect = target.getBoundingClientRect();

      const startX = startRect.left + startRect.width / 2;
      const startY = startRect.top + startRect.height / 2;
      const endX = endRect.left + endRect.width / 2;
      const endY = endRect.top + endRect.height / 2;
      
      const midY = startY - Math.abs(startY - endY) * 0.5;
      const d = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;

      pathEl.setAttribute('d', d);
      pathLengths.current[i] = pathEl.getTotalLength() || 1500;
    });
  }

  useEffect(() => {
    const handleResize = () => { if (isExplore && expandedId === null) recalculatePaths() }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isExplore, expandedId])

  // THE MASTER OVERSEER
  useEffect(() => {
    if (!containerRef.current) return
    const mainWrapper = containerRef.current
    const cards = cardRefs.current
    const compacts = gsap.utils.toArray('.compact-content', mainWrapper)
    const expandeds = gsap.utils.toArray('.expanded-content', mainWrapper)
    const lineElements = [...pathRefs.current, mainWrapper.querySelector('#center-pixels')]

    if (isExplore !== prevExplore.current) {
      gsap.killTweensOf([mainWrapper, ...cards, ...compacts, ...expandeds, ...lineElements])

      if (isExplore) {
        gsap.set(mainWrapper, { autoAlpha: 1 })
        
        cards.forEach((card, index) => {
          gsap.set(card, {
            y: 0, scale: 1, 
            width: "33.333%", opacity: 1,
            margin: index === 1 ? "0 12px 160px 12px" : "0 12px 0 12px", 
            height: index === 1 ? "75%" : "100%", 
            borderRadius: "150px 150px 16px 16px"
          })
        })
        gsap.set(compacts, { autoAlpha: 1 })
        gsap.set(expandeds, { autoAlpha: 0 })

        if (expandedId === null) {
          recalculatePaths();

          gsap.set(cards, { y: -200, opacity: 0, scale: 0.95 })
          gsap.set(mainWrapper.querySelector('#center-pixels'), { opacity: 0, y: 20 })
          pathRefs.current.forEach((path, i) => {
             gsap.set(path, { opacity: 1, strokeDasharray: pathLengths.current[i], strokeDashoffset: pathLengths.current[i] })
          })

          gsap.to(mainWrapper.querySelector('#center-pixels'), { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(2)' })
          
          pathRefs.current.forEach((path, i) => {
            gsap.to(path, { 
              strokeDashoffset: 0, duration: 1.0, 
              ease: 'power3.inOut', delay: 0.2 + (i * 0.1) 
            })
          })

          gsap.to(cards, { 
            y: 0, opacity: 1, scale: 1, 
            duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.6
          })
        }
      } else {
        gsap.to(cards, { y: -100, opacity: 0, scale: 0.95, duration: 0.5, stagger: 0.05, ease: 'power2.in' })
        gsap.to(mainWrapper.querySelector('#center-pixels'), { opacity: 0, y: 20, duration: 0.3 })
        
        pathRefs.current.forEach((path, i) => {
           gsap.to(path, { strokeDashoffset: pathLengths.current[i], duration: 0.4, ease: 'power2.inOut' })
        })

        gsap.to(mainWrapper, { 
            autoAlpha: 0, duration: 0.5, delay: 0.4,
            onComplete: () => setExpandedId(null)
        })
      }
      prevExplore.current = isExplore
      return; 
    }

    if (!isExplore) return; 
    gsap.killTweensOf([...cards, ...compacts, ...expandeds, ...lineElements])

    if (expandedId !== null) {
      const activeCard = mainWrapper.querySelector(`#card-${expandedId}`)
      const otherCards = cards.filter(c => c.id !== `card-${expandedId}`)

      gsap.to(compacts, { autoAlpha: 0, duration: 0.2 })
      gsap.to(lineElements, { opacity: 0, duration: 0.3 }) 

      gsap.to(otherCards, { width: "0%", margin: "0px", opacity: 0, duration: 0.8, ease: 'expo.inOut' })
      gsap.to(activeCard, { width: "100%", height: "100%", marginBottom: "0px", borderRadius: "60px 60px 16px 16px", duration: 0.8, ease: 'expo.inOut' })

      gsap.fromTo(activeCard.querySelector('.expanded-content'), { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.6, delay: 0.4, ease: 'power2.out' })
      gsap.fromTo(activeCard.querySelectorAll('.anim-text'), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'power2.out' })

    } else {
      gsap.to(expandeds, { autoAlpha: 0, duration: 0.3 })

      cards.forEach((card, index) => {
        gsap.to(card, {
          width: "33.333%", opacity: 1, y: 0,
          margin: index === 1 ? "0 12px 160px 12px" : "0 12px 0 12px", 
          height: index === 1 ? "75%" : "100%",
          borderRadius: "150px 150px 16px 16px",
          duration: 0.8, ease: 'expo.inOut'
        })
      })

      gsap.fromTo(compacts, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay: 0.4, ease: 'power2.out' })
      gsap.to(lineElements, { opacity: 1, duration: 0.6, delay: 0.4, ease: 'power2.out' })
    }

  }, [isExplore, expandedId])

  return (
    <>
      <style>{`
        @keyframes slowFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes slowSpin { from { transform: rotate(45deg); } to { transform: rotate(405deg); } }
        .shape-float { animation: slowFloat 6s ease-in-out infinite; }
        .shape-spin { animation: slowSpin 8s linear infinite; }
        .glass-edge-glow {
          padding: 1px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>

      <div ref={containerRef} className="invisible opacity-0 pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-10 lg:p-16">
        
        <div id="center-pixels" className="fixed bottom-[8%] left-1/2 -translate-x-1/2 z-30 flex gap-24 pointer-events-none opacity-0">
          <div ref={el => centerRefs.current[0] = el} className="w-2 h-2 bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
          <div ref={el => centerRefs.current[1] = el} className="w-2 h-2 bg-red-500 shadow-[0_0_15px_#ef4444]" />
          <div ref={el => centerRefs.current[2] = el} className="w-2 h-2 bg-amber-400 shadow-[0_0_15px_#fbbf24]" />
        </div>

        <svg className="fixed inset-0 w-full h-full pointer-events-none z-20">
          {PROJECTS.map((p, i) => (
            <path key={`path-${p.id}`} ref={(el) => (pathRefs.current[i] = el)} fill="none" stroke={p.theme.lineStroke} strokeWidth="1.5" style={{ filter: `drop-shadow(0px 0px 8px ${p.theme.lineStroke})` }} />
          ))}
        </svg>

        <div className="flex w-full max-w-6xl flex-row items-end justify-center h-[65vh] pointer-events-auto pb-8 z-40">
          {PROJECTS.map((project, index) => (
            <div 
              key={project.id}
              id={`card-${project.id}`}
              ref={el => cardRefs.current[index] = el}
              className={`project-window group relative flex flex-col overflow-hidden border backdrop-blur-2xl transition-shadow duration-500 ${project.theme.border} ${project.theme.bg} ${project.theme.hoverBox}`}
              style={{ width: "33.333%", margin: index === 1 ? "0 12px 160px 12px" : "0 12px 0 12px", height: index === 1 ? "75%" : "100%", borderRadius: "150px 150px 12px 12px" }}
            >
              
              <div 
                className="glass-edge-glow pointer-events-none absolute inset-0 z-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ borderRadius: 'inherit', background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), ${project.theme.glow}, transparent 40%)` }}
              />

              <div ref={el => targetRefs.current[index] = el} className="absolute bottom-10 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-40 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />

              {/* COMPACT VIEW */}
              <div className="compact-content absolute inset-0 flex flex-col items-center justify-center cursor-none" onClick={() => setExpandedId(project.id)}>
                <div className="absolute top-0 left-1/2 flex h-full w-[280px] -translate-x-1/2 flex-col items-center">
                    
                    <div 
                      ref={el => shapeRefs.current[index] = el}
                      className={`shape-float mt-[80px] relative flex h-16 w-16 items-center justify-center rounded-full bg-black/50 shadow-[0_0_30px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:scale-110 group-hover:bg-black/80`}
                    >
                        <div className={`absolute inset-0 rounded-full border opacity-50 ${project.theme.border}`} />
                        <div 
                            className="glass-edge-glow absolute inset-0 z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            style={{ background: `radial-gradient(100px circle at var(--shape-mouse-x) var(--shape-mouse-y), ${project.theme.glow}, transparent 50%)` }}
                        />

                        <div className={`shape-spin relative flex h-3 w-3 items-center justify-center ${project.theme.bgDark}`}>
                            <div className={`absolute inset-0 border opacity-50 ${project.theme.border}`} />
                            <div 
                                className="glass-edge-glow absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                style={{ background: `radial-gradient(100px circle at calc(var(--shape-mouse-x) - 26px) calc(var(--shape-mouse-y) - 26px), ${project.theme.glow}, transparent 50%)` }}
                            />
                        </div>
                    </div>

                    <div className="mt-auto mb-16 flex flex-col items-center text-center">
                      <span className={`mb-3 text-[10px] uppercase tracking-[0.4em] opacity-80 ${project.theme.accent}`}>{project.category}</span>
                      <h3 className={`text-xl font-light tracking-[0.2em] transition-colors ${project.theme.text}`}>{project.title}</h3>
                      <div className="mt-6 flex items-center justify-center gap-3">
                        <div className={`h-[1px] w-0 transition-all duration-700 group-hover:w-8 ${project.theme.bgDark}`} />
                        <div className={`h-1.5 w-1.5 rotate-45 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:rotate-[225deg] ${project.theme.bgSolid}`} />
                        <div className={`h-[1px] w-0 transition-all duration-700 group-hover:w-8 ${project.theme.bgDark}`} />
                      </div>
                    </div>
                </div>
              </div>

              {/* EXPANDED VIEW */}
              <div className="expanded-content invisible opacity-0 absolute inset-0 flex flex-col md:flex-row">
                <button 
                  onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                  className={`absolute right-6 top-8 z-20 flex h-12 w-12 items-center justify-center rounded-full border bg-black/50 backdrop-blur-md transition-all hover:scale-110 hover:bg-black/80 cursor-none ${project.theme.accent} ${project.theme.border}`}
                >
                  <span className="text-xl font-light">✕</span>
                </button>

                {/* ========================================================= */}
                {/* THE MINIMAL PERSIAN FRAME (JADVAL & KHATAM)               */}
                {/* Notice the padding, corner diamonds, and vignette shadow! */}
                {/* ========================================================= */}
                <div className={`relative flex h-64 w-full items-center justify-center border-b p-6 md:h-full md:w-[45%] md:border-b-0 md:border-r bg-black/40 ${project.theme.border}`}>
                    
                    {/* Outer Frame Box - anim-text class makes it slide up gracefully with GSAP */}
                    <div className={`anim-text relative h-full w-full border ${project.theme.borderBright} p-1.5`}>
                        
                        {/* The 4 Khatam Corner Diamonds */}
                        <div className={`absolute -left-1.5 -top-1.5 h-3 w-3 rotate-45 border bg-[#050505] ${project.theme.borderBright}`} />
                        <div className={`absolute -right-1.5 -top-1.5 h-3 w-3 rotate-45 border bg-[#050505] ${project.theme.borderBright}`} />
                        <div className={`absolute -left-1.5 -bottom-1.5 h-3 w-3 rotate-45 border bg-[#050505] ${project.theme.borderBright}`} />
                        <div className={`absolute -right-1.5 -bottom-1.5 h-3 w-3 rotate-45 border bg-[#050505] ${project.theme.borderBright}`} />
                        
                        {/* Inner Image Wrapper */}
                        <div className={`group/img relative h-full w-full overflow-hidden border ${project.theme.border}`}>
                            <img src={project.image} alt={project.title} className="h-full w-full object-cover mix-blend-screen opacity-70 transition-all duration-700 group-hover/img:scale-105 group-hover/img:opacity-100" />
                            
                            {/* Inner Vignette Shadow to blend edges into the frame */}
                            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
                        </div>

                    </div>
                </div>

                <div className="relative flex w-full flex-col justify-center p-8 md:w-[55%] md:p-16 lg:p-24 bg-gradient-to-br from-black/80 to-transparent">
                  <span className={`anim-text mb-4 text-[10px] uppercase tracking-[0.4em] opacity-80 ${project.theme.accent}`}>{project.category}</span>
                  <h2 className={`anim-text mb-8 text-4xl font-light tracking-[0.15em] sm:text-5xl ${project.theme.text}`}>{project.title}</h2>
                  
                  <p className={`anim-text mb-12 leading-relaxed font-light text-sm opacity-80 ${project.theme.text}`}>
                    {project.description}
                  </p>

                  <a 
                    href={project.link}
                    target="_blank" 
                    rel="noreferrer"
                    style={{ clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)' }}
                    className={`anim-text group/btn cursor-none relative flex w-fit items-center overflow-hidden bg-black/60 px-10 py-5 text-[10px] uppercase tracking-[0.4em] transition-all duration-500 hover:scale-105 active:scale-95 ${project.theme.text}`}
                  >
                    <div className={`absolute inset-0 transition-colors duration-500 border ${project.theme.border} group-hover/btn:border-transparent`} style={{ clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)' }} />
                    <div className={`absolute inset-[3px] opacity-0 scale-110 transition-all duration-500 border group-hover/btn:opacity-100 group-hover/btn:scale-100 ${project.theme.borderBright} shadow-[inset_0_0_20px_currentColor]`} style={{ clipPath: 'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)' }} />
                    
                    <div className={`absolute inset-0 -translate-x-full transition-transform duration-700 ease-out group-hover/btn:translate-x-0 ${project.theme.bgSweep}`} />
                    
                    <span className="relative z-10 font-bold transition-colors duration-300 group-hover/btn:text-white">VIEW RECORD</span>
                    
                    <div className="relative z-10 ml-6 flex h-4 w-4 items-center justify-center">
                      <span className="absolute transition-all duration-500 group-hover/btn:translate-x-4 group-hover/btn:opacity-0 group-hover/btn:scale-50">→</span>
                      <div className={`absolute flex items-center justify-center opacity-0 scale-0 transition-all duration-700 group-hover/btn:opacity-100 group-hover/btn:scale-100 group-hover/btn:rotate-[225deg]`}>
                        <div className={`absolute h-4 w-4 border opacity-80 ${project.theme.borderSolid}`} />
                        <div className={`absolute h-4 w-4 rotate-45 border opacity-80 ${project.theme.borderSolid}`} />
                        <div className={`h-1.5 w-1.5 bg-current shadow-[0_0_10px_currentColor] ${project.theme.text}`} />
                      </div>
                    </div>
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </>
  )
}