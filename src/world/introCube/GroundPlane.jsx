import { forwardRef, useMemo, useRef } from 'react'
import { PlaneGeometry, MeshPhysicalMaterial, ShaderMaterial, AdditiveBlending } from 'three'
import { useFrame } from '@react-three/fiber'
import { CUBE_HALF } from './cubeEdges'

const GroundPlane = forwardRef((props, ref) => {
  const glowRef = useRef(null)

  // 1. The Physical Dark Mirror
  const { mirrorGeo, mirrorMat } = useMemo(() => {
    const geo = new PlaneGeometry(CUBE_HALF * 4.0, CUBE_HALF * 4.0)
    const mat = new MeshPhysicalMaterial({
      color: 0x010000,       // Very deep, dark obsidian red
      metalness: 0.9,        // Highly reflective
      roughness: 0.05,       // Sharp, gorgeous reflections
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    })
    return { mirrorGeo: geo, mirrorMat: mat }
  }, [])

  // 2. The Custom Orosi Light Projector
  const { glowGeo, glowMat } = useMemo(() => {
    const geo = new PlaneGeometry(CUBE_HALF * 5.0, CUBE_HALF * 5.0)
    const mat = new ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        
        void main() {
          vec2 uv = vUv - 0.5;
          float dist = length(uv);

          // 8-Fold Radial Projection matching the Orosi glass!
          float angle = atan(uv.y, uv.x);
          float segment = 3.14159265 * 2.0 / 8.0;
          angle = mod(angle, segment);
          angle = abs(angle - segment / 2.0);
          vec2 symUv = vec2(cos(angle), sin(angle)) * dist;

          vec2 gridUv = symUv * 10.0;
          vec2 f = fract(gridUv) - 0.5;
          
          // Create sharp architectural shadow lines matching the cube
          float pattern = smoothstep(0.15, 0.0, max(abs(f.x), abs(f.y)));
          
          // Fade out elegantly into the darkness
          float falloff = smoothstep(0.4, 0.05, dist);

          // Brilliant, warm ruby caustic bleed
          vec3 lightColor = vec3(1.0, 0.05, 0.1) * pattern * falloff * 0.8;
          
          // Global ambient red glow underneath
          lightColor += vec3(0.5, 0.0, 0.05) * smoothstep(0.5, 0.1, dist) * 0.5;

          // Pulse the light softly like a breathing lantern
          lightColor *= 0.8 + 0.2 * sin(uTime * 2.0);

          gl_FragColor = vec4(lightColor, falloff);
        }
      `,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } }
    })
    return { glowGeo: geo, glowMat: mat }
  }, [])

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <group ref={ref}>
      {/* The Obsidian Mirror sits perfectly underneath the cube */}
      <mesh 
        geometry={mirrorGeo} 
        material={mirrorMat} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -CUBE_HALF - 0.15, 0]} 
      />
      
      {/* Projected Caustic Light sits slightly above the mirror to prevent z-fighting */}
      <mesh 
        ref={glowRef} 
        geometry={glowGeo} 
        material={glowMat} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -CUBE_HALF - 0.14, 0]} 
      />
    </group>
  )
})

export default GroundPlane