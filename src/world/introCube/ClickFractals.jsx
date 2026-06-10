// import { useMemo, useRef } from 'react'
// import { useFrame } from '@react-three/fiber'
// import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial, Vector3 } from 'three'

// const RIPPLES = 16
// const SEGS_PER_FLAKE = 36 
// const TOTAL_SEGS = RIPPLES * SEGS_PER_FLAKE

// const vertexShader = /* glsl */ `
// attribute float aRippleIndex;
// attribute float aProgress; 

// uniform vec4 uRipples[16];
// uniform float uSeeds[16];
// uniform float uTypes[16]; 

// varying float vAlpha;
// varying vec3 vColor;

// mat3 rotationMatrix(vec3 axis, float angle) {
//     axis = normalize(axis);
//     float s = sin(angle);
//     float c = cos(angle);
//     float oc = 1.0 - c;
//     return mat3(
//         oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
//         oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
//         oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
//     );
// }

// void main() {
//     vec4 ripple = vec4(0.0);
//     float seed = 0.0;
//     float type = 0.0;
    
//     for(int i = 0; i < 16; i++) {
//         if(float(i) == aRippleIndex) {
//             ripple = uRipples[i];
//             seed = uSeeds[i];
//             type = uTypes[i];
//         }
//     }

//     vec3 localCenter = ripple.xyz;
//     float rProgress = ripple.w; 

//     // Instant pop-in
//     float growth = smoothstep(0.0, 0.05, rProgress);

//     // 3D Rotation
//     vec3 randomAxis = normalize(vec3(sin(seed), cos(seed * 1.3), sin(seed * 2.1)));
//     mat3 rot = rotationMatrix(randomAxis, seed * 10.0);
//     vec3 rotatedPos = rot * position;
    
//     // Scale up the Golden Easter Egg
//     float scaleMult = (type > 2.5) ? 2.5 : 1.0;

//     vec3 localPos = localCenter + (rotatedPos * growth * scaleMult);
//     vec4 worldPos = modelMatrix * vec4(localPos, 1.0);

//     // Earthly Physics
//     worldPos.y -= rProgress * 0.4; 
//     worldPos.x += sin(rProgress * 6.0 + seed) * 0.02; 
//     worldPos.z += cos(rProgress * 5.0 + seed) * 0.015;

//     // Fades entirely to invisible by the end of its life
//     float globalFade = smoothstep(1.0, 0.6, rProgress); 
//     float drawMask = smoothstep(aProgress - 0.2, aProgress, growth);
    
//     vAlpha = drawMask * globalFade;

//     // --- THE STRICT COLOR ROUTER ---
//     // Pure, untempered colors. No white wash-out!
//     vec3 pureRed = vec3(1.0, 0.0, 0.0);
//     vec3 pureBlue = vec3(0.0, 0.2, 1.0);
//     // Gold requires low green and zero blue to prevent turning into yellow!
//     vec3 pureGold = vec3(1.0, 0.45, 0.0); 

//     vec3 targetColor = vec3(1.0);

//     if (type < 0.5) {
//         // TYPE 0: Ice Blue
//         targetColor = pureBlue;
//     } else if (type < 1.5) {
//         // TYPE 1: Crimson Red
//         targetColor = pureRed;
//     } else if (type < 2.5) {
//         // TYPE 2: Mixed (Center is Red, Tips are Blue)
//         targetColor = mix(pureRed, pureBlue, aProgress);
//     } else {
//         // TYPE 3: THE GOLDEN EASTER EGG
//         targetColor = mix(vec3(1.0, 0.6, 0.0), pureGold, aProgress);
//     }

//     // --- THE SPAWN & FADE DYNAMICS ---
//     // 1. Spawns as Blazing Red!
//     vec3 spawnColor = vec3(1.0, 0.1, 0.0);
    
//     // As rProgress goes from 0.0 to 0.25, it cools down into its targetColor
//     float coolDown = smoothstep(0.0, 0.25, rProgress);
//     vColor = mix(spawnColor, targetColor, coolDown);

//     // 2. Loses color as it falls!
//     // In the last 50% of its life, the color desaturates and darkens
//     float colorDrain = smoothstep(0.5, 1.0, rProgress);
//     vColor = mix(vColor, vColor * 0.1, colorDrain);

//     gl_Position = projectionMatrix * viewMatrix * worldPos;
// }
// `

// const fragmentShader = /* glsl */ `
// varying float vAlpha;
// varying vec3 vColor;

// void main() {
//     if (vAlpha <= 0.001) discard; 
//     // THE FIX: Reduced the multiplier to 1.5. 
//     // This provides a beautiful glow WITHOUT blowing the colors out to pink or white!
//     gl_FragColor = vec4(vColor * 1.5, vAlpha);
// }
// `

// function createSnowflakeData() {
//     const positions = new Float32Array(TOTAL_SEGS * 2 * 3)
//     const rippleIndices = new Float32Array(TOTAL_SEGS * 2)
//     const progresses = new Float32Array(TOTAL_SEGS * 2)

//     let i = 0
//     for (let r = 0; r < RIPPLES; r++) {
//         const size = 0.02; 

//         const posInner = 0.2 + Math.random() * 0.3;     
//         const posOuter = posInner + 0.2 + Math.random() * 0.2; 
//         const lenInner = 0.2 + Math.random() * 0.3;     
//         const lenOuter = 0.15 + Math.random() * 0.25;   
//         const posHex = 0.2 + Math.random() * 0.4;       

//         const drawHex = Math.random() > 0.3;
//         const drawOuter = Math.random() > 0.2;

//         const addSeg = (p1, p2, prog1, prog2) => {
//             positions[i*3] = p1.x; positions[i*3+1] = p1.y; positions[i*3+2] = p1.z;
//             rippleIndices[i] = r; progresses[i] = prog1; i++;
            
//             positions[i*3] = p2.x; positions[i*3+1] = p2.y; positions[i*3+2] = p2.z;
//             rippleIndices[i] = r; progresses[i] = prog2; i++;
//         };

//         for (let b = 0; b < 6; b++) {
//             const angle = b * (Math.PI / 3);
//             const dir = new Vector3(Math.cos(angle), Math.sin(angle), 0);

//             const pEnd = dir.clone().multiplyScalar(size);
//             addSeg(new Vector3(0,0,0), pEnd, 0.0, 1.0);

//             const d1 = new Vector3(Math.cos(angle + Math.PI/3), Math.sin(angle + Math.PI/3), 0);
//             const d2 = new Vector3(Math.cos(angle - Math.PI/3), Math.sin(angle - Math.PI/3), 0);

//             const m1 = dir.clone().multiplyScalar(size * posInner);
//             addSeg(m1, m1.clone().add(d1.clone().multiplyScalar(size * lenInner)), posInner, posInner + lenInner);
//             addSeg(m1, m1.clone().add(d2.clone().multiplyScalar(size * lenInner)), posInner, posInner + lenInner);

//             if (drawOuter) {
//                 const m2 = dir.clone().multiplyScalar(size * posOuter);
//                 addSeg(m2, m2.clone().add(d1.clone().multiplyScalar(size * lenOuter)), posOuter, posOuter + lenOuter);
//                 addSeg(m2, m2.clone().add(d2.clone().multiplyScalar(size * lenOuter)), posOuter, posOuter + lenOuter);
//             } else {
//                 addSeg(new Vector3(0,0,0), new Vector3(0,0,0), 0, 0);
//                 addSeg(new Vector3(0,0,0), new Vector3(0,0,0), 0, 0);
//             }

//             if (drawHex) {
//                 const nextAngle = (b+1) * Math.PI / 3;
//                 const nextDir = new Vector3(Math.cos(nextAngle), Math.sin(nextAngle), 0);
//                 addSeg(dir.clone().multiplyScalar(size * posHex), nextDir.clone().multiplyScalar(size * posHex), posHex, posHex);
//             } else {
//                 addSeg(new Vector3(0,0,0), new Vector3(0,0,0), 0, 0);
//             }
//         }
//     }
//     return { positions, rippleIndices, progresses }
// }

// export default function ClickFractals({ ripplesRef, seedsRef, typesRef }) {
//   const meshRef = useRef(null)

//   const { geometry, material } = useMemo(() => {
//     const data = createSnowflakeData()
//     const geo = new BufferGeometry()
//     geo.setAttribute('position', new BufferAttribute(data.positions, 3))
//     geo.setAttribute('aRippleIndex', new BufferAttribute(data.rippleIndices, 1))
//     geo.setAttribute('aProgress', new BufferAttribute(data.progresses, 1))
    
//     const mat = new ShaderMaterial({
//        vertexShader, fragmentShader,
//        uniforms: { 
//          uRipples: { value: new Float32Array(16 * 4) },
//          uSeeds: { value: new Float32Array(16) },
//          uTypes: { value: new Float32Array(16) } 
//        },
//        transparent: true, depthWrite: false, blending: AdditiveBlending
//     })
//     return { geometry: geo, material: mat }
//   }, [])

//   useFrame(() => {
//     if (!meshRef.current) return
//     meshRef.current.material.uniforms.uRipples.value = ripplesRef.current
//     meshRef.current.material.uniforms.uSeeds.value = seedsRef.current 
//     meshRef.current.material.uniforms.uTypes.value = typesRef.current 
//   })

//   return <lineSegments ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
// }