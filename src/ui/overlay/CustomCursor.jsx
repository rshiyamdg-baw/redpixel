import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const trailRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return

    document.body.style.cursor = 'none'

    const onMouseMove = (e) => {
      // Immediate Dot
      gsap.set(dotRef.current, { x: e.clientX, y: e.clientY })
      
      // Fast, snappy ring
      gsap.to(ringRef.current, {
        x: e.clientX, y: e.clientY,
        duration: 0.15, ease: 'power2.out'
      })

      // Elegant, lazy trailing ghost ring
      gsap.to(trailRef.current, {
        x: e.clientX, y: e.clientY,
        duration: 0.8, ease: 'elastic.out(1, 0.3)'
      })
    }

    const onMouseDown = () => {
      gsap.to(ringRef.current, { scale: 0.6, duration: 0.2 })
      gsap.to(trailRef.current, { scale: 1.5, opacity: 0, duration: 0.3 })
    }

    const onMouseUp = () => {
      gsap.to(ringRef.current, { scale: 1, duration: 0.2, ease: 'back.out(1.5)' })
      gsap.to(trailRef.current, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' })
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      document.body.style.cursor = 'auto'
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  if (typeof window !== 'undefined' && !window.matchMedia("(pointer: fine)").matches) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Central hard dot */}
      <div ref={dotRef} className="absolute top-0 left-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" />
      
      {/* Snappy primary ring */}
      <div ref={ringRef} className="absolute top-0 left-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/80 mix-blend-screen" />
      
      {/* Lazy fluid trail */}
      <div ref={trailRef} className="absolute top-0 left-0 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/20" />
    </div>
  )
}