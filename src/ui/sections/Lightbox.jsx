export default function Lightbox({ expandedWork, onClose }) {
    return (
        <div className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-700 ease-in-out ${expandedWork ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {expandedWork && (
                <>
                    {/* THE FIX: Absolute Fixed Viewport Button! Will never leave the screen! */}
                    <button onClick={onClose} className="fixed top-6 right-6 sm:top-10 sm:right-10 text-white/50 hover:text-red-400 font-mono text-xs sm:text-sm tracking-[0.3em] transition-colors z-[150] bg-black/50 px-4 py-2 border border-red-500/30 backdrop-blur-md">
                        [ TERMINATE ]
                    </button>

                    <div className="max-w-6xl w-full flex flex-col items-center relative h-full sm:h-auto justify-center mt-12 sm:mt-0">
                        <div className="hidden sm:block absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500" />
                        <div className="hidden sm:block absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500" />
                        
                        <div className="w-full max-h-[50vh] sm:h-auto sm:aspect-video bg-[#050505] relative overflow-hidden group border border-red-500/20 sm:border-none flex items-center justify-center">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff003305_1px,transparent_1px),linear-gradient(to_bottom,#ff003305_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:4rem_4rem] mix-blend-screen" />
                            <img src={expandedWork.img} className="w-full h-full max-h-[50vh] object-contain relative z-10 sm:scale-95 group-hover:scale-100 transition-transform duration-1000" alt={expandedWork.title} />
                        </div>
                        
                        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 sm:mt-8 gap-4 px-2 sm:px-4">
                            <div>
                                <h3 className="font-mono text-xl sm:text-2xl text-white font-bold tracking-[0.2em]">{expandedWork.title}</h3>
                                <p className="font-mono text-xs sm:text-sm text-white/60 mt-2 max-w-2xl">{expandedWork.desc}</p>
                            </div>
                            <a href={expandedWork.link} target="_blank" rel="noreferrer" className="shrink-0 w-full sm:w-auto text-center relative overflow-hidden group border border-red-500 px-8 py-3 font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase text-red-100">
                                <span className="relative z-10 group-hover:text-black transition-colors duration-300">Launch Core &#8599;</span>
                                <div className="absolute inset-0 bg-red-500 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}