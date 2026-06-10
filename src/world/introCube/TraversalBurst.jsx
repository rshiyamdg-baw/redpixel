import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial } from 'three'
import gsap from 'gsap'
import { useExperience } from '../../stores/useExperience'

const LINE_COUNT = 300 // Hundreds of streaks

const vertexShader = /* glsl */ `
attribute float aOffset;
attribute float aSpeed;
attribute vec3 aDirection;

varying float vAlpha;

uniform float uTime;
uniform float uBurst;

void main() {
    // The lines shoot outward from the center when uBurst spikes
    float travel = mod((uTime * 0.5 * aSpeed) + (uBurst * aSpeed * 10.0) + aOffset, 1.0);
    
    // Scale the travel exponentially so they accelerate outward
    float distance = pow(travel, 2.0) * 15.0; 
    
    // Stretch the line based on its speed and the burst intensity
    vec3 currentPos = position + (aDirection * distance);
    
    // Fade out at the extreme edges and fade in from the center
    vAlpha = smoothstep(0.0, 0.2, travel) * smoothstep(1.0, 0.6, travel) * uBurst;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(currentPos, 1.0);
}
`

const fragmentShader = /* glsl */ `
varying float vAlpha;

void main() {
    // Sharp, blinding white/cyan streaks for hyperspace travel
    vec3 color = vec3(0.8, 0.9, 1.0);
    gl_FragColor = vec4(color, vAlpha);
}
`

function createBurstData() {
    const positions = new Float32Array(LINE_COUNT * 2 * 3)
    const directions = new Float32Array(LINE_COUNT * 2 * 3)
    const offsets = new Float32Array(LINE_COUNT * 2)
    const speeds = new Float32Array(LINE_COUNT * 2)

    for (let i = 0; i < LINE_COUNT; i++) {
        // Random spherical direction
        const u = Math.random()
        const v = Math.random()
        const theta = u * 2.0 * Math.PI
        const phi = Math.acos(2.0 * v - 1.0)
        const x = Math.sin(phi) * Math.cos(theta)
        const y = Math.sin(phi) * Math.sin(theta)
        const z = Math.cos(phi)
        
        const offset = Math.random()
        const speed = 0.5 + Math.random() * 1.5
        
        // Start vertex
        positions[i * 6 + 0] = 0; positions[i * 6 + 1] = 0; positions[i * 6 + 2] = 0;
        directions[i * 6 + 0] = x; directions[i * 6 + 1] = y; directions[i * 6 + 2] = z;
        offsets[i * 2] = offset; speeds[i * 2] = speed;

        // End vertex (stretched slightly along the direction vector)
        positions[i * 6 + 3] = x * 0.2; positions[i * 6 + 4] = y * 0.2; positions[i * 6 + 5] = z * 0.2;
        directions[i * 6 + 3] = x; directions[i * 6 + 4] = y; directions[i * 6 + 5] = z;
        offsets[i * 2 + 1] = offset; speeds[i * 2 + 1] = speed;
    }
    return { positions, directions, offsets, speeds }
}

export default function TraversalBurst() {
    const linesRef = useRef(null)
    const currentPhase = useExperience((state) => state.currentPhase)
    const burstDriver = useRef({ value: 0 })

    const { geometry, material } = useMemo(() => {
        const data = createBurstData()
        const geo = new BufferGeometry()
        geo.setAttribute('position', new BufferAttribute(data.positions, 3))
        geo.setAttribute('aDirection', new BufferAttribute(data.directions, 3))
        geo.setAttribute('aOffset', new BufferAttribute(data.offsets, 1))
        geo.setAttribute('aSpeed', new BufferAttribute(data.speeds, 1))

        const mat = new ShaderMaterial({
            vertexShader, fragmentShader,
            uniforms: { uTime: { value: 0 }, uBurst: { value: 0 } },
            transparent: true, depthWrite: false, blending: AdditiveBlending
        })
        return { geometry: geo, material: mat }
    }, [])

    useEffect(() => {
        // Only burst when changing active phases, not when landing!
        if (currentPhase !== 0) {
            gsap.killTweensOf(burstDriver.current)
            burstDriver.current.value = 1.0 // Instant maximum intensity
            
            // Fast decay for a punchy visual impact
            gsap.to(burstDriver.current, { value: 0, duration: 1.2, ease: "power3.out" })
        }
    }, [currentPhase])

    useFrame((state) => {
        if (!linesRef.current) return
        linesRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
        linesRef.current.material.uniforms.uBurst.value = burstDriver.current.value
    })

    return <lineSegments ref={linesRef} geometry={geometry} material={material} frustumCulled={false} />
}