import { useEffect, useState } from 'react'
import { useDetectGPU } from '@react-three/drei'
import { useExperience } from '../stores/useExperience'
import Experience from './Experience'
import Layout from './Layout'

export default function App() {
  const GPUTier = useDetectGPU()
  const setLowEnd = useExperience((state) => state.setLowEnd)
  
  // The Gatekeeper State
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Wait for the Drei hook to finish benchmarking the hardware
    if (GPUTier) {
      // Determine if the device needs the optimized path
      const isWeak = GPUTier.isMobile || GPUTier.tier <= 1
      setLowEnd(isWeak)
      
      // We add a tiny 500ms delay to let the user see the beautiful loader
      // and guarantee Zustand is populated before the Canvas requests it.
      const timer = setTimeout(() => setIsReady(true), 500)
      return () => clearTimeout(timer)
    }
  }, [GPUTier, setLowEnd])

  // =========================================================
  // THE LOADING SCREEN (Active while GPU is benchmarking)
  // =========================================================
  if (!isReady) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
        {/* Persian Shamseh Loading Animation */}
        <div className="relative flex h-16 w-16 items-center justify-center animate-[spin_4s_linear_infinite]">
            <div className="absolute inset-0 border border-red-500/40 rotate-45" />
            <div className="absolute inset-0 border border-red-500/40" />
            <div className="h-3 w-3 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,1)] animate-pulse" />
        </div>
        
        <p className="mt-8 font-mono text-[10px] tracking-[0.4em] text-red-500/80 uppercase animate-pulse">
          Initializing Architecture...
        </p>
      </div>
    )
  }

  // =========================================================
  // THE MAIN APPLICATION (Only boots when safe!)
  // =========================================================
  return (
    <>
      <Experience />
      <Layout />
    </>
  )
}