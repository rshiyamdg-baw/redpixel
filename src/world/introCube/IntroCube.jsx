import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three' 
import gsap from 'gsap'
import { worldState } from '../../core/world/worldState'
import { useExperience, MODES } from '../../stores/useExperience'
import CubeInteractor from './CubeInteractor'
import CubeRays from './CubeRays'
import CircuitLines from './CircuitLines' 
// import ClickFractals from './ClickFractals' 
import InternalDepth from './InternalDepth'
import GlassShell from './GlassShell' 
import GemAura from './GemAura'

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

  const rushDriver = useRef({ value: 0 })
  const rushSeed = useRef(0.5)

  useEffect(() => {
    rushSeed.current = Math.random()
    gsap.killTweensOf(rushDriver.current)
    rushDriver.current.value = 1.0 
    gsap.to(rushDriver.current, { value: 0, duration: 3.0, ease: 'power2.out' })
  }, [isTransitioning, mode])

  // --- THE SNAPPY, LIGHTWEIGHT SNOWFLAKE ENGINE ---
  // Expanded to 16 slots so you can spam click!
  const rippleUniforms = useRef(new Float32Array(16 * 4))
  const rippleSeeds = useRef(new Float32Array(16)) 
  const rippleTypes = useRef(new Float32Array(16))
  const rippleDrivers = useRef(Array.from({ length: 16 }, () => ({ progress: 0 })))
  let rippleIndex = useRef(0)
  const totalClicks = useRef(0)

  const triggerSpatialPulse = (point, isLocal = false) => {
    if (!groupRef.current) return;
    const localPoint = isLocal ? point.clone() : groupRef.current.worldToLocal(point.clone());

    // 1. NO MORE GREEDY VACUUM! Just grab the next slot directly.
    const targetIdx = rippleIndex.current % 16;
    rippleIndex.current++;
    totalClicks.current += 1;
    const isGolden = totalClicks.current % 25 === 0; // Every 20th click?
    // Type 0: Blue, Type 1: Red, Type 2: Mixed, Type 3: GOLDEN
    const flakeType = isGolden ? 3.0 : Math.floor(Math.random() * 3.0);

    // 2. Lock the exact coordinate you clicked!
    rippleUniforms.current[targetIdx * 4 + 0] = localPoint.x;
    rippleUniforms.current[targetIdx * 4 + 1] = localPoint.y;
    rippleUniforms.current[targetIdx * 4 + 2] = localPoint.z;
    rippleSeeds.current[targetIdx] = Math.random() * 100.0; 
    rippleTypes.current[targetIdx] = flakeType;

    const driver = rippleDrivers.current[targetIdx];
    gsap.killTweensOf(driver);
    driver.progress = 0;
    const fallDuration = isGolden ? 5.0 : 2.5;
    // 3. One continuous movement: It spawns, falls, and fades out over 1.5 seconds!
    gsap.to(driver, {
      progress: 1.0,
      duration: fallDuration, 
      ease: "power1.out", // Natural deceleration as it falls
      onUpdate: () => { rippleUniforms.current[targetIdx * 4 + 3] = driver.progress },
      onComplete: () => {
        // Reset seamlessly
        rippleUniforms.current[targetIdx * 4 + 3] = 0 
      }
    })
  }

  useEffect(() => {
    if (currentPhase !== 0) setIsHovered(false)
  }, [currentPhase])

  useEffect(() => {
    const isExplore = mode === MODES.EXPLORE
    gsap.killTweensOf(exploreAnim.current)
    
    if (isExplore) {
      triggerSpatialPulse(new Vector3(0, 0, 0), true) 
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
    const currentScale = groupRef.current.scale.x
    groupRef.current.scale.setScalar(MathUtils.lerp(currentScale, targetScale, 8 * delta))

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
            <CubeInteractor onHoverChange={setIsHovered} onPump={(p) => triggerSpatialPulse(p, false)} />
            <InternalDepth />
            <CubeRays />
            <CircuitLines ripplesRef={rippleUniforms} rushRef={rushDriver} rushSeedRef={rushSeed} /> 
            
            {/* <ClickFractals ripplesRef={rippleUniforms} seedsRef={rippleSeeds} typesRef={rippleTypes} /> */}
            
            <GlassShell /> 
          </group>
      </group>
    </group>
  )
}