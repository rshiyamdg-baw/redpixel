// import { useMemo, useRef } from 'react'
// import { useFrame } from '@react-three/fiber'
// import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial } from 'three'

// const PATH_COUNT = 250 
// const TURNS_PER_PATH = 4

// const vertexShader = /* glsl */ `
// attribute float aProgress;
// attribute float aOffset;
// attribute float aSpeed;

// varying float vProgress;
// varying float vOffset;
// varying float vSpeed;
// varying vec3 vLocalPosition; // THE FIX: Use local!

// void main() {
//    vProgress = aProgress;
//    vOffset = aOffset;
//    vSpeed = aSpeed;
   
//    vLocalPosition = position; // Pass raw local geometry
//    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// }
// `
// const fragmentShader = /* glsl */ `
// varying float vProgress;
// varying float vOffset;
// varying float vSpeed;
// varying vec3 vLocalPosition; // THE FIX: Use local!

// uniform float uTime;
// uniform float uTravelTime;
// uniform vec4 uRipples[16]; 
// uniform float uRush;       
// uniform float uRushSeed;

// void main() {
//     float phase = uTravelTime * vSpeed + (vOffset * 80.0);
//     float t = sin(phase) * 0.5 + 0.5; 
//     float dir = sign(cos(phase)); 
//     float dist = (vProgress - t) * dir;
    
//     float intensity = 0.0;
    
//     // --- BASE CIRCUIT COLORS ---
//     vec3 baseBlue = vec3(0.02, 0.1, 0.4); 
//     vec3 baseRed = vec3(0.8, 0.0, 0.1);  
//     vec3 color = mix(baseBlue, baseRed, sin(uTime * 1.5 + vOffset * 10.0) * 0.5 + 0.5);

//     // --- THE LIGHTER, ELEGANT RUSH ---
//     // Deep, rich colors instead of blinding neon, guiding the eye without stealing attention
//     vec3 rushColor = mix(vec3(0.1, 0.0, 0.4), vec3(0.5, 0.0, 0.2), fract(uRushSeed * 7.77));
//     color = mix(color, rushColor, uRush * 0.5);

//     // Shorter tail so it looks like organized data, not a messy blur
//     float tail = -0.15 - (uRush * 0.2);
//     if (dist < 0.0 && dist > tail) {
//         intensity = smoothstep(tail, 0.0, dist);
//     }
    
//     // Data heads remain sharp, but not overly bright
//     if (abs(dist) < 0.015) {
//         intensity = 1.0 + uRush; 
//         color = mix(color, vec3(1.0, 0.5, 0.6), 0.5); 
//     }

//     // --- THE RED-TO-BLUE MICRO-GAME STARBURST ---
//     float rippleGlow = 0.0;
//     vec3 hotRed = vec3(1.0, 0.1, 0.2);   // The core of the click
//     vec3 coolBlue = vec3(0.0, 0.3, 1.0); // The faded edges of the ripple

//     for(int i = 0; i < 16; i++) {
//         float rProgress = uRipples[i].w;
//         if(rProgress > 0.0) {
//             vec3 rPos = uRipples[i].xyz;
//             vec3 delta = vLocalPosition - rPos;
//             float distanceToClick = length(delta);
            
//             float angle1 = atan(delta.y, delta.x);
//             float angle2 = atan(delta.z, delta.x);
            
//             // Star distortion
//             float starDistortion = sin(angle1 * 8.0 + uTime * 1.5) * sin(angle2 * 8.0) * 0.3;
            
//             // DRASTICALLY SMALLER RADIUS: Maxes out at 1.2 units (Perfect for localized clicks!)
//             float currentRadius = rProgress * 1.5; 
            
//             float distortedDistance = distanceToClick + starDistortion * rProgress;
            
//             // Thinner, sharper rings so they don't look muddy
//             float ringThickness = 0.05 + (rProgress * 0.1); 
//             float distFromRing = abs(distortedDistance - currentRadius);
            
//             float ring = smoothstep(ringThickness, 0.0, distFromRing);
//             float fadeOut = 1.0 - rProgress ;  

//             if(ring > 0.0) {
//                 // THERMODYNAMIC SHIFT: Starts Hot Red, expands into Cool Blue!
//                 vec3 burstColor = mix(hotRed, coolBlue, rProgress);
                
//                 color = mix(color, burstColor, ring * fadeOut);
                
//                 // Significantly reduced noise/glow so you can stack them beautifully!
//                 rippleGlow += ring * fadeOut * 1.5; 
//             }
//         }
//     }

//     intensity += rippleGlow + (uRush * 0.2);
    
//     gl_FragColor = vec4(color * 1.5, intensity * (0.4 + uRush * 0.3));
// }
// `

// function createCircuitGrid() {
//    const totalSegments = PATH_COUNT * TURNS_PER_PATH
//    const positions = new Float32Array(totalSegments * 2 * 3)
//    const progresses = new Float32Array(totalSegments * 2)
//    const offsets = new Float32Array(totalSegments * 2)
//    const speeds = new Float32Array(totalSegments * 2)

//    let i = 0
//    for(let p = 0; p < PATH_COUNT; p++) {
//        let x = (Math.random() - 0.5) * 2.2
//        let y = (Math.random() - 0.5) * 2.2
//        let z = (Math.random() - 0.5) * 2.2
//        const offset = Math.random()
//        const speed = 0.3 + Math.random() * 0.7

//        for(let turn = 0; turn < TURNS_PER_PATH; turn++) {
//            const axis = Math.floor(Math.random() * 3)
//            const dir = Math.sign(Math.random() - 0.5)
//            const length = 0.2 + Math.random() * 0.8
           
//            let nx = x, ny = y, nz = z
//            if (axis === 0) nx += dir * length
//            if (axis === 1) ny += dir * length
//            if (axis === 2) nz += dir * length

//            const startProg = turn / TURNS_PER_PATH
//            const endProg = (turn + 1) / TURNS_PER_PATH

//            positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
//            progresses[i] = startProg; offsets[i] = offset; speeds[i] = speed;
//            i++;
           
//            positions[i*3] = nx; positions[i*3+1] = ny; positions[i*3+2] = nz;
//            progresses[i] = endProg; offsets[i] = offset; speeds[i] = speed;
//            i++;

//            x = nx; y = ny; z = nz;
//        }
//    }
//    return { positions, progresses, offsets, speeds }
// }

// export default function CircuitLines({ ripplesRef, rushRef, rushSeedRef }) {
//   const linesRef = useRef(null)
//   const travelTime = useRef(0)

//   const { geometry, material } = useMemo(() => {
//     const data = createCircuitGrid()
//     const geo = new BufferGeometry()
//     geo.setAttribute('position', new BufferAttribute(data.positions, 3))
//     geo.setAttribute('aProgress', new BufferAttribute(data.progresses, 1))
//     geo.setAttribute('aOffset', new BufferAttribute(data.offsets, 1))
//     geo.setAttribute('aSpeed', new BufferAttribute(data.speeds, 1))
    
//     const mat = new ShaderMaterial({
//        vertexShader, fragmentShader,
//        uniforms: { 
//          uTime: { value: 0 },
//          uTravelTime: { value: 0 },
//          uRipples: { value: new Float32Array(8 * 4) },
//          uRush: { value: 0 },
//          uRushSeed: { value: 0 }
//        },
//        transparent: true, depthWrite: false, blending: AdditiveBlending
//     })
//     return { geometry: geo, material: mat }
//   }, [])

//   useFrame((state, delta) => {
//     if (!linesRef.current) return
    
//     const rush = rushRef.current.value
//     const seed = rushSeedRef.current
    
//     // SLOWER, LIGHTER RUSH: Max speed is now only 3x to 5x normal speed, instead of 23x!
//     const speedMultiplier = 1.0 + (rush * (2.0 + seed * 3.0))
//     travelTime.current += delta * speedMultiplier

//     const mat = linesRef.current.material
//     mat.uniforms.uTime.value = state.clock.elapsedTime
//     mat.uniforms.uTravelTime.value = travelTime.current 
//     mat.uniforms.uRipples.value = ripplesRef.current
//     mat.uniforms.uRush.value = rush
//     mat.uniforms.uRushSeed.value = seed
//   })

//   return <lineSegments ref={linesRef} geometry={geometry} material={material} frustumCulled={false} />
// }