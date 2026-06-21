import { useMemo, useRef, useEffect } from 'react'
import { SphereGeometry, ShaderMaterial, BackSide, MathUtils, Vector2 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useExperience, MODES } from '../../stores/useExperience'
import gsap from 'gsap'

export default function InnerWorldEnvironment() {
  const currentPhase = useExperience((state) => state.currentPhase)
  const mode = useExperience((state) => state.mode)
  
  const envRef = useRef(null)
  const prevPhaseRef = useRef(currentPhase)

  const uniforms = useRef({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uTravelOffset: { value: 0 }, 
      uPointer: { value: new Vector2(0, 0) },
      uExplorePan: { value: 0 } // A dedicated subtle pan for Explore Mode
  })

  // --- 1. FADE LOGIC ---
  useEffect(() => {
      if (currentPhase >= 2) {
          gsap.to(uniforms.current.uOpacity, { 
              value: 1.0, duration: 0.6, ease: 'power2.out', overwrite: true
          })
      } else {
          gsap.to(uniforms.current.uOpacity, { 
              value: 0.0, duration: 0.6, ease: 'power2.inOut', overwrite: true 
          })
      }
  }, [currentPhase])

  // --- 2. TRAVERSAL: ROTATING THE 4-WALL ROOM ---
  useEffect(() => {
      // Phase 2 (Works) maps to Wall 0. Phase 3 (Contact) maps to Wall 1.
      // Every time we move, we physically rotate the room by exactly 90 degrees (Math.PI / 2)
      if (currentPhase >= 2 && prevPhaseRef.current >= 2 && currentPhase !== prevPhaseRef.current) {
          const targetRotation = (currentPhase - 2) * (Math.PI / 2.0)
          gsap.to(uniforms.current.uTravelOffset, {
              value: targetRotation, 
              duration: 1.8,
              ease: 'power3.inOut'
          })
      }
      prevPhaseRef.current = currentPhase
  }, [currentPhase])

  // --- 3. EXPLORE MODE PARALLAX ---
  useEffect(() => {
      const isExplore = mode === MODES.EXPLORE && currentPhase >= 2
      gsap.to(uniforms.current.uExplorePan, {
          value: isExplore ? 0.3 : 0.0, // A subtle, physical pan to the side
          duration: 1.5,
          ease: 'power3.inOut'
      })
  }, [mode, currentPhase])

  const { geometry, material } = useMemo(() => {
    const geo = new SphereGeometry(30, 64, 64)
    
    const mat = new ShaderMaterial({
      uniforms: uniforms.current,
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        #define PI 3.14159265
        #define HALF_PI 1.57079632

        uniform float uTime;
        uniform float uOpacity;
        uniform float uTravelOffset;
        uniform float uExplorePan;
        uniform vec2 uPointer;
        varying vec3 vWorldPos;

        vec2 hash2(vec2 p) {
             p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
             return fract(sin(p) * 43758.5453);
        }

        vec3 getVitrail(vec2 localUv, float seed) {
            float symmetry = 6.0;
            if(seed == 1.0) symmetry = 8.0;
            if(seed == 2.0) symmetry = 10.0;
            if(seed == 3.0) symmetry = 12.0;

            float angle = atan(localUv.y, localUv.x);
            float radius = length(localUv);
            
            float segment = PI * 2.0 / symmetry;
            angle = mod(angle, segment);
            angle = abs(angle - segment / 2.0);
            vec2 symUv = vec2(cos(angle), sin(angle)) * radius;

            vec2 gridUv = symUv * 3.5; 
            vec2 gridP = floor(gridUv);
            vec2 gridF = fract(gridUv);

            float minDist = 100.0;
            vec2 closestCell = vec2(0.0);
            vec2 closestCenter = vec2(0.0);

            for(int j=-1; j<=1; j++)
            for(int i=-1; i<=1; i++){
                vec2 b = vec2(float(i), float(j));
                vec2 h = hash2(gridP + b + seed * 13.37);
                vec2 center = b + h;
                vec2 r = center - gridF;
                float d = dot(r, r);
                if(d < minDist){
                    minDist = d;
                    closestCell = gridP + b;
                    closestCenter = center;
                }
            }

            float edgeDist = 100.0;
            for(int j=-2; j<=2; j++)
            for(int i=-2; i<=2; i++){
                vec2 b = vec2(float(i), float(j));
                vec2 h = hash2(gridP + b + seed * 13.37);
                vec2 center = b + h;
                if(dot(center - closestCenter, center - closestCenter) > 0.00001) {
                    float d = dot(0.5 * (closestCenter + center) - gridF, normalize(center - closestCenter));
                    edgeDist = min(edgeDist, d);
                }
            }

            float shardSeed = fract(sin(dot(closestCell, vec2(12.9898, 78.233))) * 43758.5453);
            vec3 col;
            
            if (shardSeed < 0.60) col = vec3(0.9, 0.05, 0.1);       
            else if (shardSeed < 0.80) col = vec3(0.0, 0.3, 1.0);   
            else col = vec3(1.0, 0.7, 0.0);                         

            float lead = smoothstep(0.40, 0.0, edgeDist);
            col = mix(col, vec3(0.0), lead);

            return col;
        }

        void main() {
            // --- TRUE CAMERA PARALLAX ---
            // Instead of shifting UVs, we physically tilt the incoming optical ray!
            vec3 p = normalize(vWorldPos);
            p.x -= uPointer.x * 0.15;
            p.y -= uPointer.y * 0.15;
            p = normalize(p);

            // Calculate the absolute spherical angle
            float theta = atan(p.z, p.x);

            // Add the Traversal Rotation and Explore Pan
            // We add 10.0 * PI to ensure the angle is always positive for the mod function
            float activeTheta = theta + uTravelOffset + uExplorePan + (PI * 10.0);

            // --- THE 4-WALL ARCHITECTURE ---
            // Divide the 360-degree room into 4 exact 90-degree walls.
            float wallID = floor(mod(activeTheta + PI/4.0, 2.0 * PI) / HALF_PI);
            
            // localTheta ranges from -PI/4 to PI/4 for each wall
            float localTheta = mod(activeTheta + PI/4.0, HALF_PI) - PI/4.0;

            // Project the sphere onto a FLAT WALL.
            // This naturally shrinks the center and wildly stretches the corners with true perspective!
            float wallDist = 1.0 / cos(localTheta);
            vec2 wallUv = vec2(tan(localTheta), p.y * wallDist);

            // --- ANCHORED SHEAR PHYSICS (The Moving Light Fix) ---
            float sunTime = (uTime + 5.0) * 0.2;
            float sunX = sin(sunTime) * 0.8;
            float sunY = cos(sunTime * 0.5) * 0.5;

            // Calculate depth. Top of wall = 0.0, Bottom of floor = 2.0.
            // This anchors the shadow to the ceiling. The glass never moves!
            float shadowDepth = max(0.0, 1.0 - p.y); 

            vec2 projUv = wallUv;
            // The shadow bends and skews across the floor as the sun moves!
            projUv.x -= sunX * shadowDepth * 0.3;
            projUv.y -= sunY * shadowDepth * 0.15;

            // Fetch the pattern for this specific wall
            vec3 vitrailColor = getVitrail(projUv * 1.5, wallID);

            // --- THE SPOTLIGHT ---
            float distFromSun = length(wallUv - vec2(sunX, sunY * 0.5));
            float lightBeam = smoothstep(2.0, 0.0, distFromSun);
            lightBeam = pow(lightBeam, 1.5) * 3.0; // Blinding center, dark edges

            vec3 finalShadow = vitrailColor * lightBeam;
            finalShadow += vitrailColor * smoothstep(3.0, 0.0, distFromSun) * 0.15;

            // --- THE SEAMLESS PILLAR FIX ---
            // Fade the light to pitch black exactly at the 90-degree corners of the room
            float pillarDarkness = smoothstep(0.65, 1.0, abs(localTheta) / (PI / 4.0));
            finalShadow *= (1.0 - pillarDarkness);

            // Soften background when Explore UI is open
            finalShadow *= 1.0 - (uExplorePan * 1.5);

            gl_FragColor = vec4(finalShadow, uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false, 
      side: BackSide     
    })
    return { geometry: geo, material: mat }
  }, [])

  useFrame((state) => {
    if (!envRef.current) return
    
    uniforms.current.uTime.value = state.clock.elapsedTime
    
    // Smoothly update the pointer uniform for the true camera tilt
    uniforms.current.uPointer.value.x = MathUtils.lerp(uniforms.current.uPointer.value.x, state.pointer.x, 0.05)
    uniforms.current.uPointer.value.y = MathUtils.lerp(uniforms.current.uPointer.value.y, state.pointer.y, 0.05)
  })

  return (
    <mesh 
      ref={envRef} 
      geometry={geometry} 
      material={material} 
      raycast={() => null} 
    />
  )
}