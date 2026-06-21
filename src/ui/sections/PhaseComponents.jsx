const SkillBar = ({ name, percent }) => (
    <div className="mb-3">
        <div className="flex justify-between font-mono text-[10px] text-white/70 mb-1 tracking-widest">
            <span>{name}</span>
            <span className="text-red-400">{percent}%</span>
        </div>
        <div className="h-1 w-full bg-red-900/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-red-500 skill-fill origin-left" style={{ width: `${percent}%` }} />
        </div>
    </div>
)

const LanguageDots = ({ name, level }) => (
    <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-[10px] text-white/70 tracking-widest">{name}</span>
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-sm lang-dot opacity-0 scale-0 ${i <= level ? 'bg-red-500' : 'bg-red-900/30'}`} />
            ))}
        </div>
    </div>
)

const ExperienceNode = ({ title, role, date }) => (
    <div className="relative pl-4 border-l border-red-500/30 mb-4 last:mb-0 exp-node opacity-0 -translate-x-2">
        <div className="absolute left-[-4px] top-1 w-2 h-2 bg-black border border-red-500 rounded-sm" />
        <h4 className="font-mono text-xs text-red-400 tracking-widest">{title}</h4>
        <p className="font-mono text-[10px] text-white/70 mt-1">{role}</p>
        <p className="font-mono text-[8px] text-red-500/50 mt-1 tracking-widest">{date}</p>
    </div>
)

export const PhaseAbout = () => (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 relative z-10 mt-6 ui-reveal opacity-0" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
        <div className="w-20 sm:w-32 shrink-0 flex flex-col gap-6">
            <div className="w-full aspect-square relative group mx-auto sm:mx-0">
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-red-500/80 transition-all group-hover:-translate-x-1 group-hover:-translate-y-1" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-red-500/80 transition-all group-hover:translate-x-1 group-hover:translate-y-1" />
                <div className="absolute inset-0 bg-black overflow-hidden border border-red-500/20">
                    <img src="/images/me.jpg" alt="Profile" className="w-full h-full object-cover grayscale mix-blend-luminosity group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                </div>
                <div className="absolute inset-0 bg-red-500/10 mix-blend-multiply pointer-events-none" />
            </div>
            <div className="hidden sm:block">
                <h4 className="font-mono text-[10px] text-red-500/60 mb-2 border-b border-red-500/20 pb-1 tracking-[0.2em]">SYS.LANG</h4>
                <LanguageDots name="ENGLISH" level={5} />
                <LanguageDots name="JAVASCRIPT" level={5} />
                <LanguageDots name="GLSL" level={4} />
            </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
            <div>
                <h4 className="font-mono text-[10px] text-red-500/60 mb-3 border-b border-red-500/20 pb-1 tracking-[0.2em]">CORE.SKILLS</h4>
                <SkillBar name="React / Three.js" percent={95} />
                <SkillBar name="WebGL / Shaders" percent={85} />
                <SkillBar name="GSAP Animation" percent={90} />
                <SkillBar name="UI Architecture" percent={88} />
            </div>
            <div>
                <h4 className="font-mono text-[10px] text-red-500/60 mb-3 border-b border-red-500/20 pb-1 tracking-[0.2em]">TIMELINE.LOG</h4>
                <ExperienceNode title="Senior Spatial Dev" role="Redpixel Corp" date="2021 - PRESENT" />
                <ExperienceNode title="Frontend Sorcerer" role="Hogwarts Web Agency" date="2018 - 2021" />
            </div>
        </div>
    </div>
)

export const PhaseWorks = ({ onOpenWork }) => {
    const works = [
        { id: 1, title: 'PROJECT.ALPHA', img: '/images/project-alpha.jpg', desc: 'A volumetric WebGL dashboard.', link: '#' },
        { id: 2, title: 'PROJECT.BETA', img: '/images/project-beta.jpg', desc: 'Cyberpunk e-commerce experience.', link: '#' },
        { id: 3, title: 'PROJECT.GAMMA', img: '/images/project-gamma.jpg', desc: 'Generative art platform.', link: '#' }
    ]
    return (
        <div className="flex flex-col mt-4 sm:mt-6 relative z-10 gap-3">
            {works.map((work, index) => (
                <div key={work.id} onClick={() => onOpenWork(work)} className="ui-reveal opacity-0 w-full group cursor-pointer border border-red-500/20 hover:border-red-500/80 bg-black/40 hover:bg-black/80 transition-all duration-300 relative overflow-hidden flex items-center p-2 sm:p-3" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
                    <div className="absolute inset-0 bg-red-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                    <img src={work.img} className="w-12 h-12 sm:w-16 sm:h-16 object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 border border-red-500/30" alt={work.title} />
                    <div className="flex-1 pl-4 z-10">
                        <h3 className="font-mono text-xs sm:text-sm text-white tracking-[0.2em] truncate group-hover:text-red-300 transition-colors">{work.title}</h3>
                        <p className="font-mono text-[8px] sm:text-[10px] text-white/40 mt-1 uppercase tracking-wider truncate">{work.desc}</p>
                    </div>
                    <span className="font-mono text-[8px] sm:text-[10px] text-red-500/0 group-hover:text-red-400 tracking-widest transition-all duration-300 translate-x-4 group-hover:translate-x-0 hidden sm:block pr-2">
                        OPEN_NODE
                    </span>
                </div>
            ))}
        </div>
    )
}

// // THE OLD PHASE 3: Sleek, Minimalist Vitrail Theme??
// export const PhaseContact = () => (
//     <div className="mt-6 relative z-10 flex flex-col gap-6 ui-reveal opacity-0" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
        
//         {/* Sleek Dark Glass Box */}
//         <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 border border-white/10 bg-[#050000]/80 backdrop-blur-md p-6 relative group hover:border-amber-600/50 transition-colors duration-500">
            
//             <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500 to-red-600 opacity-50" />

//             <div>
//                 <p className="font-mono text-[10px] text-amber-500/50 tracking-[0.3em] mb-2">SECURE_LINK</p>
//                 <p className="font-mono text-sm sm:text-base text-white/90 font-light tracking-wide break-all">hello@yourdomain.com</p>
//                 <p className="font-mono text-xs text-red-400/80 mt-2 tracking-widest">@YourTelegramID</p>
//             </div>
            
//             <button className="h-12 px-8 bg-transparent border border-amber-500/30 hover:bg-amber-600/10 text-amber-500 font-mono text-xs tracking-[0.3em] transition-all duration-300">
//                 INITIATE
//             </button>
//         </div>
//     </div>
// )

// // THE OLD PHASE 4: The Deep Void
// export const PhaseDeepVoid = () => (
//     <div className="mt-6 relative z-10 flex flex-col gap-6 ui-reveal opacity-0" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
//         <div className="p-6 border border-red-900/30 bg-black/60 relative">
//             <p className="font-mono text-xs text-white/40 leading-loose text-justify tracking-wider">
//                 "You have traversed the physical shell. Welcome to the deep resonance chamber. This is a space reserved for high-value architecture, experimental systems, and encrypted data."
//             </p>
//             <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-600/50 to-transparent mt-6" />
//         </div>
//     </div>
// )

export const PHASE_CONTENT = {
  1: { title: 'SYS.ABOUT', desc: 'BIOMETRIC_DATA // SKILL_MATRIX // LOG' },
  2: { title: 'SYS.WORKS', desc: 'PROJECT_NODES // ARCHIVES // DATA_VIZ' },
  3: { title: 'SYS.SIGNAL', desc: 'RESONANCE // DIRECT_PING // ENCRYPTED' },
  4: { title: 'SYS.VOID', desc: 'DEEP_STORAGE // EXPERIMENTAL_CHAMBER' },
}