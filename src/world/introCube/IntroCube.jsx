import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils } from 'three' 
import gsap from 'gsap'
import { worldState } from '../../core/world/worldState'
import { useExperience, MODES } from '../../stores/useExperience'
import CubeInteractor from './CubeInteractor'
import GlassShell from './GlassShell' 
import GemAura from './GemAura'
import VoidDust from './VoidDust'
import Floor from './Floor'

export default function IntroCube() {
  const groupRef = useRef(null)
  const parallaxGroupRef = useRef(null) 
  
  const [isHovered, setIsHovered] = useState(false)
  const { viewport } = useThree()
  
  const currentPhase = useExperience((state) => state.currentPhase)
  const isTransitioning = useExperience((state) => state.isTransitioning)
  const mode = useExperience((state) => state.mode)

  const exploreAnim = useRef({ progress: 0 })
  const randomView = useRef({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    if (currentPhase !== 0) setIsHovered(false)
  }, [currentPhase])

  useEffect(() => {
    const isExplore = mode === MODES.EXPLORE
    gsap.killTweensOf(exploreAnim.current)
    
    if (isExplore) {
      randomView.current = {
        x: (Math.random() - 0.5) * Math.PI * 1.5,
        y: (Math.random() - 0.5) * Math.PI * 2.0,
        z: (Math.random() - 0.5) * Math.PI * 0.8
      }
    }
    
    gsap.to(exploreAnim.current, {
      progress: isExplore ? 1 : 0,
      duration: 1.5,
      ease: 'power3.inOut'
    })
    
    return () => gsap.killTweensOf(exploreAnim.current)
  }, [mode])

  useFrame((state, delta) => {
    if (parallaxGroupRef.current) {
        const targetPosX = state.pointer.x * 0.2;
        const targetPosY = state.pointer.y * 0.2;
        parallaxGroupRef.current.position.x = MathUtils.lerp(parallaxGroupRef.current.position.x, targetPosX, 3 * delta);
        parallaxGroupRef.current.position.y = MathUtils.lerp(parallaxGroupRef.current.position.y, targetPosY, 3 * delta);

        const targetRotX = state.pointer.y * 0.25;
        const targetRotY = state.pointer.x * 0.25;
        parallaxGroupRef.current.rotation.x = MathUtils.lerp(parallaxGroupRef.current.rotation.x, targetRotX, 3 * delta);
        parallaxGroupRef.current.rotation.y = MathUtils.lerp(parallaxGroupRef.current.rotation.y, targetRotY, 3 * delta);
    }

    if (!groupRef.current) return

    // OPTIMIZATION: If we are in Phase 3 or beyond, the cube is behind us!
    // We lock its animations to save processing power!
    if (currentPhase >= 3) {
       groupRef.current.position.set(0,0,0);
       groupRef.current.scale.setScalar(1.0);
       return; 
    }

    // --- PHASE 1 & 2 ANIMATIONS ---
    const ext = exploreAnim.current.progress
    const slideOffsetX = viewport.width > 6 ? -1.8 : 0 
    const slideOffsetY = viewport.width <= 6 ? -1.0 : 0 
    
    groupRef.current.position.x = MathUtils.lerp(groupRef.current.position.x, slideOffsetX * ext, 5 * delta)
    groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, slideOffsetY * ext, 5 * delta)

    const unfoldScale = 1 + worldState.unfold * 0.65
    const hoverSwell = (isHovered && currentPhase === 0) ? 1.08 : 1.0 
    const targetModeScale = viewport.width <= 6 ? 0.45 : 0.65
    const modeScale = MathUtils.lerp(1.0, targetModeScale, ext)
    
    const targetScale = (worldState.cubeScale || 1.0) * unfoldScale * hoverSwell * modeScale
    groupRef.current.scale.setScalar(MathUtils.lerp(groupRef.current.scale.x, targetScale, 8 * delta))

    const baseRotY = worldState.cubeRotation || 0
    const targetRotX = ext * randomView.current.x
    const targetRotY = baseRotY + (ext * randomView.current.y)
    const targetRotZ = ext * randomView.current.z

    groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 4 * delta)
    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 4 * delta)
    groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 4 * delta)

    if (currentPhase === 0 && !isTransitioning && ext < 0.01) {
      const spinSpeed = (isHovered && currentPhase === 0) ? 0.4 : 0.15
      groupRef.current.rotation.y += delta * spinSpeed
      groupRef.current.rotation.x += Math.sin(state.clock.elapsedTime * 0.35) * 0.12 * delta
    }
  })

  return (
    <group>
      <GemAura />
      <group ref={parallaxGroupRef}>
          <group ref={groupRef}>
            <CubeInteractor onHoverChange={setIsHovered} />
            <GlassShell /> 
          </group>
          <VoidDust />
          <Floor />
      </group>
    </group>
  )
}