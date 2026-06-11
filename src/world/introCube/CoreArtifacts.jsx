// import { useRef, useMemo, useEffect } from 'react'
// import { useFrame, useThree } from '@react-three/fiber'
// import { AdditiveBlending, MathUtils, MeshStandardMaterial, MeshBasicMaterial } from 'three'
// import gsap from 'gsap'
// import { useExperience, MODES } from '../../stores/useExperience'

// export default function CoreArtifacts() {
//   const groupRef = useRef(null)
//   const mesh1Ref = useRef(null)
//   const mesh2Ref = useRef(null)
//   const mesh3Ref = useRef(null)
//   const pointLightRef = useRef(null) // NEW: Dynamic lighting for the artifact
  
//   const currentPhase = useExperience((state) => state.currentPhase)
//   const mode = useExperience((state) => state.mode)
//   const { viewport } = useThree()

//   const stateDriver = useRef({ extraction: 0 })

//   // Outer Holographic Cage
//   const wireMaterial = useMemo(() => new MeshBasicMaterial({
//     color: 0xff1133, wireframe: true, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false
//   }), [])

//   // Inner Physical Core
//   const solidMaterial = useMemo(() => new MeshStandardMaterial({
//     color: 0x110000, emissive: 0x330011, roughness: 0.2, metalness: 0.9, transparent: true, opacity: 0
//   }), [])

//   useEffect(() => {
//     const isExplore = mode === MODES.EXPLORE
//     gsap.killTweensOf(stateDriver.current)

//     if (isExplore) {
//       gsap.to(stateDriver.current, {
//         extraction: 1, duration: 2.0, ease: 'elastic.out(1, 0.6)',
//       })
//     } else {
//       gsap.to(stateDriver.current, {
//         extraction: 0, duration: 1.0, ease: 'power3.inOut',
//       })
//     }

//     return () => gsap.killTweensOf(stateDriver.current)
//   }, [mode])

//   useFrame((state, delta) => {
//     if (!groupRef.current) return
//     const time = state.clock.elapsedTime
//     const ext = stateDriver.current.extraction
    
//     // Position extraction
//     const targetX = viewport.width > 6 ? -3.0 : 0
//     const targetZ = viewport.width > 6 ? 2.5 : 2.0 
//     // On mobile, it stays centered but high up so text goes below it
//     const targetY = viewport.width <= 6 ? 1.2 : 0

//     groupRef.current.position.set(
//       MathUtils.lerp(groupRef.current.position.x, targetX * ext, 4 * delta),
//       MathUtils.lerp(groupRef.current.position.y, targetY * ext, 4 * delta),
//       MathUtils.lerp(groupRef.current.position.z, targetZ * ext, 4 * delta)
//     )
    
//     groupRef.current.scale.setScalar(0.2 + (ext * 0.8)) // Swells grandly

//     wireMaterial.opacity = MathUtils.lerp(0, 0.9, ext)
//     solidMaterial.opacity = MathUtils.lerp(0, 0.95, ext)
//     if (pointLightRef.current) pointLightRef.current.intensity = ext * 2.0

//     // Artifact Animations
//     if (currentPhase === 1 && mesh1Ref.current) {
//       mesh1Ref.current.rotation.x += delta * 0.5
//       mesh1Ref.current.rotation.y += delta * 0.8
//     }
//     if (currentPhase === 2 && mesh2Ref.current) {
//       mesh2Ref.current.rotation.y += delta * 0.4
//       mesh2Ref.current.rotation.z += delta * 0.2
//     }
//     if (currentPhase === 3 && mesh3Ref.current) {
//       mesh3Ref.current.rotation.z += delta * 1.5
//       mesh3Ref.current.rotation.x = Math.PI / 2 + Math.sin(time * 2) * 0.2 // Wobbly radar
//     }
//   })

//   // A helper component to render the dual-material setup cleanly
//   const ArtifactGeo = ({ geoRef, PhaseID, children }) => (
//     <group ref={geoRef} visible={currentPhase === PhaseID}>
//       <mesh material={solidMaterial}>{children}</mesh>
//       <mesh material={wireMaterial} scale={1.05}>{children}</mesh>
//     </group>
//   )

//   return (
//     <group ref={groupRef}>
//       <pointLight ref={pointLightRef} color="#ff3355" distance={3} decay={2} />
//       <ArtifactGeo geoRef={mesh1Ref} PhaseID={1}><torusKnotGeometry args={[0.5, 0.12, 128, 32]} /></ArtifactGeo>
//       <ArtifactGeo geoRef={mesh2Ref} PhaseID={2}><icosahedronGeometry args={[0.7, 1]} /></ArtifactGeo>
//       <ArtifactGeo geoRef={mesh3Ref} PhaseID={3}>
//         <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
//         <mesh position={[0, 0.2, 0]} material={solidMaterial}><sphereGeometry args={[0.2, 16, 16]}/></mesh>
//       </ArtifactGeo>
//     </group>
//   )
// }