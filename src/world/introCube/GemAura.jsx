import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, PlaneGeometry, ShaderMaterial } from 'three'
import gsap from 'gsap'
import { useExperience } from '../../stores/useExperience'

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uLanding;

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);

    // Deep, swirling majestic corona
    float angle = atan(uv.y, uv.x);
    float rays = sin(angle * 6.0 + uTime * 0.2) * 0.5 + 0.5;
    rays *= sin(angle * 12.0 - uTime * 0.1) * 0.5 + 0.5;

    // Soft gradient fading gracefully into absolute void
    float coreGlow = smoothstep(1.0, 0.0, dist);
    float haloGlow = smoothstep(0.8, 0.2, dist);

    // A dark, bloody crimson center fading into hot red edges
    vec3 deepRed = vec3(0.08, 0.0, 0.01);
    vec3 brightRed = vec3(0.4, 0.0, 0.05);

    vec3 finalColor = mix(deepRed, brightRed, haloGlow);
    finalColor += vec3(1.0, 0.1, 0.2) * rays * coreGlow * 0.2;

    // Only fully visible and glorious during the Landing Phase (uLanding = 1.0)
    float alpha = (coreGlow * 0.6 + rays * 0.2) * uLanding;

    gl_FragColor = vec4(finalColor, alpha);
}
`

export default function GemAura() {
  const meshRef = useRef(null)
  const currentPhase = useExperience((state) => state.currentPhase)
  const phaseDriver = useRef({ value: 1 }) // Starts at 1 for Phase 0

  useEffect(() => {
    gsap.killTweensOf(phaseDriver.current)
    // Fades out beautifully when we dive inside
    gsap.to(phaseDriver.current, {
      value: currentPhase === 0 ? 1 : 0,
      duration: 1.5,
      ease: 'power3.inOut'
    })
  }, [currentPhase])

  const { geometry, material } = useMemo(() => {
    const geo = new PlaneGeometry(18, 18) // Gloriously massive
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uLanding: { value: 1 }
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    return { geometry: geo, material: mat }
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uLanding.value = phaseDriver.current.value

    // TRUE BILLBOARDING: The aura ALWAYS faces the camera flawlessly!
    meshRef.current.quaternion.copy(state.camera.quaternion)
    
    // Position it slightly behind the cube relative to the camera
    const cameraPos = state.camera.position.clone()
    const dir = cameraPos.normalize().multiplyScalar(-4) // 4 units behind the center
    meshRef.current.position.copy(dir)
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}