import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useExperience } from '../../stores/useExperience'

export default function Floor() {
  const currentPhase = useExperience((state) => state.currentPhase)
  const lightRef = useRef(null)
  const floorGroupRef = useRef(null)
  const floorMatRef = useRef(null)

  useEffect(() => {
    // Active ONLY in Phase 2 (Index 1)
    const isActive = currentPhase === 1

    // 1. The Sun Beam (Directional Light does NOT decay over distance!)
    if (lightRef.current) {
      gsap.to(lightRef.current, {
        intensity: isActive ? 3.0 : 0, // 3.0 is a brilliant, guaranteed sun beam
        duration: 1.5,
        ease: 'power2.inOut'
      })
    }

    // 2. The Rising Platform
    if (floorGroupRef.current) {
      gsap.to(floorGroupRef.current.position, {
        y: isActive ? -1.5 : -10.0,
        duration: 1.5,
        ease: 'power3.inOut'
      })
    }

    // 3. Fade the floor
    if (floorMatRef.current) {
      gsap.to(floorMatRef.current, {
        opacity: isActive ? 1.0 : 0.0,
        duration: 1.5,
        ease: 'power2.inOut'
      })
    }
  }, [currentPhase])

  return (
    <group>
      {/* THE GUARANTEED SUN BEAM */}
      <directionalLight
        ref={lightRef}
        position={[4, 3, 0]} 
        intensity={0} 
        castShadow
        shadow-mapSize={[2048, 2048]} 
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0001} 
      />

      <group ref={floorGroupRef} position={[0, -0.85, 0]}>
        
        {/* THE CRIMSON STAGE */}
        {/* A beautifully visible floor that guarantees absolute contrast against the black shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8, 18]} />
          <meshStandardMaterial 
            ref={floorMatRef} 
            color="#ffffff" // Rich, bright crimson
            metalness={0.2}       
            roughness={0.4}      
            transparent={true} 
            opacity={0}           
          />
        </mesh>
      </group>
    </group>
  )
}