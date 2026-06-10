import { useMemo, useRef } from 'react'
import { BoxGeometry, ShaderMaterial, DoubleSide, AdditiveBlending } from 'three'
import { useFrame } from '@react-three/fiber'
import { useExperience } from '../../stores/useExperience'
import gsap from 'gsap'
import { CUBE_HALF } from './cubeEdges'

const vertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vLocalNormal;
varying vec3 vViewDir;
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  // vLocalNormal remains identical across a single face, letting us generate a unique "Face ID"
  vLocalNormal = normal; 
  
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPosition.xyz;
  
  vec4 mvPosition = viewMatrix * worldPosition;
  vViewDir = -mvPosition.xyz;
  
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vLocalNormal;
varying vec3 vViewDir;
varying vec2 vUv;
varying vec3 vWorldPos;

uniform float uTime;
uniform float uClickWave;

// 2D Hash for static glass shard shapes
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

// 3D Hash for animated caustics
vec3 hash3(vec3 p) {
    p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
              dot(p,vec3(269.5,183.3,246.1)),
              dot(p,vec3(113.5,271.9,124.6)));
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

// Sharp Digital Voronoi for the Inner Core
float voronoi3D(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    float res = 100.0;
    for(int k=-1; k<=1; k++)
    for(int j=-1; j<=1; j++)
    for(int i=-1; i<=1; i++) {
        vec3 b = vec3(float(i), float(j), float(k));
        vec3 r = vec3(b) - f + hash3(p + b);
        float d = dot(r, r);
        res = min(res, d);
    }
    return res;
}

void main() {
    bool isInside = !gl_FrontFacing;
    vec3 normal = normalize(vNormal);
    if(isInside) normal = -normal;

    vec3 viewDir = normalize(vViewDir);
    float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
    float glow = pow(fresnel, 3.0);

    // --- FACE ID GENERATION (Guarantees every face is totally unique!) ---
    vec3 absNorm = abs(vLocalNormal);
    float faceSeed = 0.0;
    if (absNorm.x > 0.5) faceSeed = vLocalNormal.x > 0.0 ? 1.1 : 2.2;
    else if (absNorm.y > 0.5) faceSeed = vLocalNormal.y > 0.0 ? 3.3 : 4.4;
    else faceSeed = vLocalNormal.z > 0.0 ? 5.5 : 6.6;

    // --- THE SNOWFLAKE FOLD ---
    vec2 uv = vUv - 0.5;
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    // Twist the snowflake rotation differently per face!
    angle += faceSeed * 1.5; 

    float segment = 3.14159265 * 2.0 / 6.0;
    angle = mod(angle, segment);
    angle = abs(angle - segment / 2.0);
    vec2 symUv = vec2(cos(angle), sin(angle)) * radius;

    // --- 2-PASS POLYGONAL VORONOI SHATTER ---
    vec2 gridUv = symUv * 14.0; // High density = lots of tiny shards
    vec2 p = floor(gridUv);
    vec2 f = fract(gridUv);

    // Pass 1: Find the closest cell center
    float minDist = 100.0;
    vec2 closestCell = vec2(0.0);
    vec2 closestCenter = vec2(0.0);

    for(int j=-1; j<=1; j++)
    for(int i=-1; i<=1; i++){
        vec2 b = vec2(float(i), float(j));
        // We inject faceSeed here so the shatter pattern is randomized per face
        vec2 h = hash2(p + b + faceSeed * 13.37);
        vec2 center = b + h;
        vec2 r = center - f;
        float d = dot(r, r);
        if(d < minDist){
            minDist = d;
            closestCell = p + b;
            closestCenter = center;
        }
    }

    // Pass 2: Calculate Euclidean edge distance to create perfectly straight polygonal cuts
    float edgeDist = 100.0;
    for(int j=-2; j<=2; j++)
    for(int i=-2; i<=2; i++){
        vec2 b = vec2(float(i), float(j));
        vec2 h = hash2(p + b + faceSeed * 13.37);
        vec2 center = b + h;
        if(dot(center - closestCenter, center - closestCenter) > 0.00001) {
            float d = dot(0.5 * (closestCenter + center) - f, normalize(center - closestCenter));
            edgeDist = min(edgeDist, d);
        }
    }

    // --- WEIGHTED COLOR ASSIGNMENT ---
    // Extract a color seed specific to this single shard of glass
    float shardSeed = fract(sin(dot(closestCell, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 glassColor;
    
    // 70% Red Variations, 10% Dark Blue, 15% Neon Blue, 5% Cyber Yellow!
    if (shardSeed < 0.35) glassColor = vec3(0.9, 0.05, 0.1);       // Crimson
    else if (shardSeed < 0.55) glassColor = vec3(0.5, 0.0, 0.05);  // Dark Blood
    else if (shardSeed < 0.70) glassColor = vec3(1.0, 0.15, 0.25); // Neon Pinkish-Red
    else if (shardSeed < 0.80) glassColor = vec3(0.0, 0.1, 0.4);   // Deep Space Blue
    else if (shardSeed < 0.95) glassColor = vec3(0.0, 0.6, 1.0);   // Neon Cyber Blue
    else glassColor = vec3(1.0, 0.8, 0.0);                         // Bright Yellow

    // 3D Bevel creates the illusion of physical glass thickness
    float bevel = smoothstep(0.0, 0.4, edgeDist);
    glassColor *= mix(0.3, 1.0, bevel);

    // Gently breathing light
    glassColor *= 0.8 + 0.2 * sin(uTime * 2.5 + shardSeed * 10.0);

    // --- OUTER HEXAGON SHAPE MASK ---
    // Keep UV upright relative to face so the bounding hexagon doesn't spin
    float hex = max(abs(uv.y), abs(uv.x * 0.866025 + uv.y * 0.5));
    hex = max(hex, abs(uv.x * 0.866025 - uv.y * 0.5));
    
    // Randomize the size of the snowflake slightly per face
    float hexSize = 0.43 + 0.05 * fract(faceSeed * 2.23);
    float isOutside = step(hexSize, hex);

    // Erase colors outside the snowflake, leaving a dark void glass
    vec3 voidColor = vec3(0.02, 0.0, 0.01);
    glassColor = mix(glassColor, voidColor, isOutside);

    // Iron lead lines separating the shards
    float lead = smoothstep(0.04, 0.0, edgeDist);
    lead = mix(lead, 0.0, isOutside); // Erase lead outside the snowflake
    
    // Add a solid iron frame around the edge of the snowflake
    float hexBorder = smoothstep(0.015, 0.0, abs(hex - hexSize));
    lead = max(lead, hexBorder);

    // --- RENDERING PASSES ---
    vec3 finalColor = vec3(0.0);
    float alpha = 0.0;

    if (isInside) {
        float timeScale = uTime * 0.5;
        vec3 noiseSpace = vWorldPos * (3.0 - uClickWave * 1.5) + vec3(0, timeScale, 0);

        float v1 = voronoi3D(noiseSpace);
        float v2 = voronoi3D(noiseSpace * 2.0 - timeScale);

        float caustic = pow(1.0 - v1, 4.0) * v2;

        // The click interaction flashes blinding white/yellow energy
        vec3 causticTint = mix(glassColor, vec3(1.0, 0.9, 0.8), uClickWave);
        vec3 innerLight = causticTint * caustic * (3.0 + uClickWave * 5.0);
        
        // Inner caustics bleed through the stained glass
        finalColor = innerLight + (glow * 0.2 * glassColor);
        alpha = 0.6 + glow * 0.3 + caustic * 2.0;
        
    } else {
        vec3 leadColor = vec3(0.01, 0.01, 0.01);
        finalColor = mix(glassColor, leadColor, lead);

        // Intensely glossy reflections applied ONLY to the glass, keeping iron matte
        finalColor += glow * 1.5 * (1.0 - lead);

        alpha = mix(0.4, 1.0, lead) + glow * 0.4;
    }

    // --- MASTER CUBE RIM BORDER ---
    float bX = min(vUv.x, 1.0 - vUv.x);
    float bY = min(vUv.y, 1.0 - vUv.y);
    float hardEdge = smoothstep(0.015, 0.0, min(bX, bY));

    // The entire cube is framed by a glowing dark crimson line that flashes blue on click
    vec3 edgeColor = mix(vec3(0.8, 0.0, 0.1), vec3(0.0, 0.6, 1.0), uClickWave);
    finalColor = mix(finalColor, edgeColor, hardEdge); 
    alpha = max(alpha, hardEdge);

    gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
}
`

export default function GlassShell() {
  const currentPhase = useExperience((state) => state.currentPhase)
  const clickWaveRef = useRef({ value: 0 })

  const { geometry, material } = useMemo(() => {
    const geo = new BoxGeometry(CUBE_HALF * 2.0, CUBE_HALF * 2.0, CUBE_HALF * 2.0)
    
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { 
        uTime: { value: 0 },
        uClickWave: { value: 0 } 
      },
      transparent: true,
      depthWrite: false, 
      blending: AdditiveBlending, 
      side: DoubleSide 
    })
    return { geometry: geo, material: mat }
  }, [])

  useFrame((state) => {
    if (!material) return
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uClickWave.value = clickWaveRef.current.value
  })

  // Triggers only when exploring the inner core
  const handleGlassClick = (e) => {
      if (currentPhase === 3) { 
          e.stopPropagation()
          gsap.killTweensOf(clickWaveRef.current)
          clickWaveRef.current.value = 1.0
          gsap.to(clickWaveRef.current, { value: 0, duration: 2.0, ease: 'power2.out' })
      }
  }

  return (
      <mesh 
        geometry={geometry} 
        material={material} 
        onPointerDown={handleGlassClick}
        raycast={currentPhase === 3 ? undefined : () => null}
      />
  )
}