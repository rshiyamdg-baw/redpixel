import { useState } from 'react'

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
                    <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" alt="Profile" className="w-full h-full object-cover grayscale mix-blend-luminosity group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
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
            <div className="sm:hidden">
                <h4 className="font-mono text-[10px] text-red-500/60 mb-2 border-b border-red-500/20 pb-1 tracking-[0.2em]">SYS.LANG</h4>
                <LanguageDots name="ENGLISH" level={5} />
                <LanguageDots name="JAVASCRIPT" level={5} />
                <LanguageDots name="GLSL" level={4} />
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
    // Robust, highly distinct visual placeholders for the works
    const works = [
        { id: 1, title: 'PROJECT.ALPHA', img: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&w=800&q=80', desc: 'A volumetric WebGL dashboard.', link: '#' },
        { id: 2, title: 'PROJECT.BETA', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', desc: 'Cyberpunk e-commerce experience.', link: '#' },
        { id: 3, title: 'PROJECT.GAMMA', img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80', desc: 'Generative art platform.', link: '#' }
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

export const PhaseContact = () => (
    <div className="mt-6 relative z-10 flex flex-col gap-6 ui-reveal opacity-0" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-red-500/20 bg-black/40 p-4">
            <div>
                <p className="font-mono text-xs text-white/50 tracking-widest mb-1">PRIMARY COMMS</p>
                <p className="font-mono text-xs sm:text-sm text-white break-all">hello@yourdomain.com</p>
                <p className="font-mono text-xs text-red-400 mt-1">@YourTelegramID</p>
            </div>
            <div className="hidden sm:flex w-12 h-12 border border-red-500/30 items-center justify-center bg-red-500/5 shrink-0">
                 <span className="animate-pulse text-red-500 font-mono text-xl">&#9679;</span>
            </div>
        </div>
        
        <div className="relative pt-2">
            <div className="absolute top-0 left-0 w-2 h-[1px] bg-red-500" />
            <div className="absolute top-0 left-0 w-[1px] h-2 bg-red-500" />
            
            <p className="font-mono text-[10px] text-red-400/80 mb-2 tracking-[0.3em]">INITIATE PING_</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <input type="email" placeholder="ENTER_EMAIL_ADDR..." className="flex-1 h-10 bg-black/60 border border-red-500/20 px-3 text-xs text-white font-mono focus:outline-none focus:border-red-500/80 transition-colors placeholder:text-white/20" />
                <button className="h-10 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 font-mono text-xs tracking-widest px-6 border border-red-500/30 transition-all">
                    SEND
                </button>
            </div>
        </div>
    </div>
)

export const PHASE_CONTENT = {
  1: { title: 'SYS.ABOUT', desc: 'BIOMETRIC_DATA // SKILL_MATRIX // LOG' },
  2: { title: 'SYS.WORKS', desc: 'PROJECT_NODES // ARCHIVES // DATA_VIZ' },
  3: { title: 'SYS.SIGNAL', desc: 'COMMS_LINK // DIRECT_PING // ENCRYPTED' },
}