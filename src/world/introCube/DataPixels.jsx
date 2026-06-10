import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial } from 'three'
import gsap from 'gsap'
import { worldState } from '../../core/world/worldState'
import { useExperience, MODES } from '../../stores/useExperience'

const LINE_COUNT = 300 

const vertexShader = /* glsl */ `
attribute float aProgress;
attribute float aOffset;
attribute float aSpeed;

varying float vProgress;
varying float vOffset;
varying float vSpeed;

void main() {
   vProgress = aProgress;
   vOffset = aOffset;
   vSpeed = aSpeed;
   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
varying float vProgress;
varying float vOffset;
varying float vSpeed;

uniform float uTime;
uniform float uExplore;
uniform float uEnergy;
uniform float uClickSpike; // THE KINETIC INJECTION

void main() {
    // The click spike makes them race insanely fast for a brief moment
    float currentSpeed = vSpeed * (1.0 + uExplore * 2.0 + uEnergy * 1.5 + uClickSpike * 8.0);
    float phase = uTime * currentSpeed + (vOffset * 100.0);
    
    float t = sin(phase) * 0.5 + 0.5; 
    float dir = sign(cos(phase)); 
    float dist = (vProgress - t) * dir;
    
    float intensity = 0.0;
    vec3 color = vec3(0.0);
    
    vec3 colorBlue = vec3(0.0, 0.4, 1.0);
    vec3 colorRed = vec3(1.0, 0.0, 0.3);
    vec3 themeColor = mix(colorBlue, colorRed, sin(uTime * 3.0 + vOffset * 20.0) * 0.5 + 0.5);

    // Make the trail longer when they are speeding up
    float tailLength = -0.15 - (uClickSpike * 0.2);

    if (dist < 0.0 && dist > tailLength) {
        intensity = smoothstep(tailLength, 0.0, dist);
        color = themeColor * intensity;
    }
    
    if (abs(dist) < 0.015) {
        intensity = 1.0;
        color = vec3(1.0); 
    }

    float edgeFade = smoothstep(0.0, 0.05, vProgress) * smoothstep(1.0, 0.95, vProgress);

    // Brighter alpha when spiked
    float alpha = intensity * edgeFade * (0.3 + uExplore * 0.7 + uClickSpike * 0.5);
    gl_FragColor = vec4(color * 1.5, alpha);
}
`

function createDataGrid() {
   const positions = new Float32Array(LINE_COUNT * 2 * 3)
   const progresses = new Float32Array(LINE_COUNT * 2)
   const offsets = new Float32Array(LINE_COUNT * 2)
   const speeds = new Float32Array(LINE_COUNT * 2)

   let i = 0
   for(let line=0; line < LINE_COUNT; line++) {
       const x = (Math.random() - 0.5) * 2.5
       const y = (Math.random() - 0.5) * 2.5
       const z = (Math.random() - 0.5) * 2.5
       const axis = Math.floor(Math.random() * 3)
       const length = 0.2 + Math.random() * 0.8
       
       let ex=x, ey=y, ez=z
       if (axis === 0) ex += length
       if (axis === 1) ey += length
       if (axis === 2) ez += length
       
       const offset = Math.random()
       const speed = 0.5 + Math.random() * 1.5

       positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
       progresses[i] = 0.0; offsets[i] = offset; speeds[i] = speed;
       i++;
       
       positions[i*3] = ex; positions[i*3+1] = ey; positions[i*3+2] = ez;
       progresses[i] = 1.0; offsets[i] = offset; speeds[i] = speed;
       i++;
   }
   return { positions, progresses, offsets, speeds }
}

export default function DataPixels({ kineticSpike }) {
  const linesRef = useRef(null)
  const mode = useExperience((state) => state.mode)
  const exploreDriver = useRef({ value: 0 })
  
  useEffect(() => {
     gsap.killTweensOf(exploreDriver.current)
     gsap.to(exploreDriver.current, {
        value: mode === MODES.EXPLORE ? 1 : 0,
        duration: 1.0, ease: 'power2.out'
     })
  }, [mode])

  const { geometry, material } = useMemo(() => {
    const data = createDataGrid()
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(data.positions, 3))
    geo.setAttribute('aProgress', new BufferAttribute(data.progresses, 1))
    geo.setAttribute('aOffset', new BufferAttribute(data.offsets, 1))
    geo.setAttribute('aSpeed', new BufferAttribute(data.speeds, 1))
    
    const mat = new ShaderMaterial({
       vertexShader, fragmentShader,
       uniforms: { uTime: { value: 0 }, uExplore: { value: 0 }, uEnergy: { value: 0 }, uClickSpike: { value: 0 } },
       transparent: true, depthWrite: false, blending: AdditiveBlending
    })
    return { geometry: geo, material: mat }
  }, [])

  useFrame((state) => {
    if (!linesRef.current) return
    const mat = linesRef.current.material
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uExplore.value = exploreDriver.current.value
    mat.uniforms.uEnergy.value = worldState.particleEnergy
    mat.uniforms.uClickSpike.value = kineticSpike // Instantly reacts to the GSAP driver in IntroCube
  })

  return <lineSegments ref={linesRef} geometry={geometry} material={material} frustumCulled={false} />
}