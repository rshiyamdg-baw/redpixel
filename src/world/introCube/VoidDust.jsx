import { useMemo, useRef, useEffect } from 'react'
import { AdditiveBlending, ShaderMaterial, InstancedBufferGeometry, InstancedBufferAttribute, BoxGeometry, MathUtils, DoubleSide } from 'three'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { useExperience, MODES } from '../../stores/useExperience'

export default function VoidDust() {
  const meshRef = useRef(null)
  
  const currentPhase = useExperience((state) => state.currentPhase)
  const mode = useExperience((state) => state.mode)
  
  // Animation Drivers
  const warpRef = useRef({ value: 0 })
  const exploreRef = useRef({ value: 0 })
  const prevPhase = useRef(currentPhase)

  // 1. PHASE TRAVERSE ANIMATION (Hyper-Warp Burst)
  useEffect(() => {
    // 0-Indexed: Phase 3 is 2, Phase 4 is 3
    if (currentPhase >= 2 && currentPhase !== prevPhase.current) {
        gsap.killTweensOf(warpRef.current)
        warpRef.current.value = 1.0 // Trigger Warp!
        gsap.to(warpRef.current, { value: 0, duration: 2.5, ease: "expo.out" })
    }
    prevPhase.current = currentPhase
  }, [currentPhase])

  // 2. EXPLORE MODE ANIMATION (Vortex Swirl)
  useEffect(() => {
    gsap.killTweensOf(exploreRef.current)
    gsap.to(exploreRef.current, { 
        value: mode === MODES.EXPLORE ? 1.0 : 0.0, 
        duration: 1.5, 
        ease: "power3.inOut" 
    })
  }, [mode])

  const { geometry, material } = useMemo(() => {
    const shardCount = 400 // Highly performant 3D instances
    
    // Base geometry: a standard 3D Box. We will mathematically deform it into rays and shards!
    const baseGeo = new BoxGeometry(1, 1, 1)
    const geo = new InstancedBufferGeometry()
    geo.index = baseGeo.index
    geo.attributes = baseGeo.attributes

    const offsets = new Float32Array(shardCount * 3)
    const colors = new Float32Array(shardCount * 3)
    const scales = new Float32Array(shardCount * 3)
    const speeds = new Float32Array(shardCount)
    const rotations = new Float32Array(shardCount)

    for (let i = 0; i < shardCount; i++) {
      // Spawn in a wide cylinder around the camera's Z-path
      offsets[i * 3 + 0] = (Math.random() - 0.5) * 30 
      offsets[i * 3 + 1] = (Math.random() - 0.5) * 20 
      offsets[i * 3 + 2] = -1.0 - (Math.random() * 30.0) // Deep void depth    

      const colorSeed = Math.random()
      if (colorSeed < 0.5) { 
          colors[i * 3 + 0] = 1.0; colors[i * 3 + 1] = 0.02; colors[i * 3 + 2] = 0.1; // Ruby
      } else if (colorSeed < 0.8) { 
          colors[i * 3 + 0] = 0.0; colors[i * 3 + 1] = 0.3; colors[i * 3 + 2] = 1.0;  // Sapphire
      } else { 
          colors[i * 3 + 0] = 1.0; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 0.0;  // Saffron Gold
      }

      // 50% are Razor-Thin Light Rays, 50% are Floating Glass Diamonds
      const isRay = Math.random() > 0.5
      if (isRay) {
          scales[i * 3 + 0] = 0.02 + Math.random() * 0.02 // Thin X
          scales[i * 3 + 1] = 0.02 + Math.random() * 0.02 // Thin Y
          scales[i * 3 + 2] = 2.0 + Math.random() * 4.0   // Massive Z Length!
      } else {
          scales[i * 3 + 0] = 0.2 + Math.random() * 0.3
          scales[i * 3 + 1] = 0.2 + Math.random() * 0.3
          scales[i * 3 + 2] = 0.01 + Math.random() * 0.05 // Flat Z
      }

      speeds[i] = Math.random() * 0.5 + 0.1
      rotations[i] = Math.random() * Math.PI * 2.0
    }

    geo.setAttribute('aOffset', new InstancedBufferAttribute(offsets, 3))
    geo.setAttribute('aColor', new InstancedBufferAttribute(colors, 3)) 
    geo.setAttribute('aScale', new InstancedBufferAttribute(scales, 3))
    geo.setAttribute('aSpeed', new InstancedBufferAttribute(speeds, 1))
    geo.setAttribute('aRotation', new InstancedBufferAttribute(rotations, 1))

    const mat = new ShaderMaterial({
      vertexShader: `
        attribute vec3 aOffset;
        attribute vec3 aColor;
        attribute vec3 aScale;
        attribute float aSpeed;
        attribute float aRotation;
        
        varying vec3 vColor;
        varying vec2 vUv;
        
        uniform float uTime;
        uniform float uWarp; 
        uniform float uExplore;
        
        void main() {
          vColor = aColor; 
          vUv = uv;
          
          // 1. Initial 3D Shape (Scaling the box into a ray or diamond)
          vec3 localPos = position * aScale;

          // Stretch length massively during warp!
          localPos.z += localPos.z * uWarp * 10.0; 

          // Rotate the flat shards to look like diamond cuts
          float s = sin(aRotation + uTime * aSpeed * 0.5);
          float c = cos(aRotation + uTime * aSpeed * 0.5);
          mat2 rotXY = mat2(c, -s, s, c);
          localPos.xy = rotXY * localPos.xy;
          
          // 2. Spatial Positioning
          vec3 pos = aOffset;
          
          // Constant slow drift towards the camera, but EXPLODES during a Warp
          pos.z += (uTime * aSpeed) + (uWarp * 25.0 * aSpeed);
          
          // Wrap around logic so the tunnel is infinite
          pos.z = mod(pos.z + 5.0, 30.0) - 30.0; 

          // THE EXPLORE VORTEX: Shards physically swirl around the camera!
          float swirlAngle = uExplore * aSpeed * 5.0;
          float sc = cos(swirlAngle);
          float ss = sin(swirlAngle);
          mat2 swirlMat = mat2(sc, -ss, ss, sc);
          pos.xy = swirlMat * pos.xy;

          vec4 mvPosition = modelViewMatrix * vec4(pos + localPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying vec2 vUv;
        uniform float uOpacity;
        
        void main() {
          // Sharp, glassy fade on the edges of the 3D geometry
          float edgeGlow = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) * 
                           smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
                           
          float alpha = edgeGlow * uOpacity;
          if (alpha < 0.01) discard;
          
          // Hot white core for realism
          vec3 finalColor = mix(vColor, vec3(1.0), edgeGlow * 0.5);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 }, 
        uWarp: { value: 0 },
        uExplore: { value: 0 }
      }
    })

    return { geometry: geo, material: mat }
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uWarp.value = warpRef.current.value;
    mat.uniforms.uExplore.value = exploreRef.current.value;
    
    // Fades in beautifully at Phase 3 (Index 2) and Phase 4 (Index 3)
    const targetOpacity = currentPhase >= 2 ? 1.0 : 0.0;
    mat.uniforms.uOpacity.value = MathUtils.lerp(mat.uniforms.uOpacity.value, targetOpacity, delta * 3.0);
  })

  // frustumCulled={false} to guarantee survival in the deep void!
  return (
    <mesh ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
  )
}