import { useMemo } from 'react'
import { PlaneGeometry, ShaderMaterial, AdditiveBlending } from 'three'
import { useFrame } from '@react-three/fiber'

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
varying vec2 vUv;

uniform float uTime;
uniform float uClickWave;

vec3 hash3(vec3 p) {
    p = vec3( dot(p,vec3(127.1,311.7, 74.7)), dot(p,vec3(269.5,183.3,246.1)), dot(p,vec3(113.5,271.9,124.6)));
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

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
    vec2 uv = vUv - 0.5;
    float radius = length(uv);
    
    // A soft radial mask to fade the light out perfectly into the black void
    float mask = smoothstep(0.5, 0.0, radius);
    if (mask <= 0.001) discard;

    // 6-Fold radial symmetry matching the snowflake cube above!
    float angle = atan(uv.y, uv.x);
    angle += uTime * 0.05; // Extremely slow, majestic rotation
    
    float segment = 3.14159265 * 2.0 / 6.0;
    angle = mod(angle, segment);
    angle = abs(angle - segment / 2.0);
    vec2 symUv = vec2(cos(angle), sin(angle)) * radius;

    // Generate the shattered light rays
    float timeScale = uTime * 0.2;
    vec3 noiseSpace = vec3(symUv * 10.0, timeScale);
    
    float v1 = voronoi3D(noiseSpace);
    float v2 = voronoi3D(noiseSpace * 1.5 - timeScale * 0.5);
    
    // Sharp, high-contrast caustic lines
    float caustic = pow(1.0 - v1, 3.0) * v2;
    
    // Chromatic separation for the projected light
    vec3 redBase = vec3(0.8, 0.05, 0.1);
    vec3 blueAccent = vec3(0.0, 0.3, 1.0);
    
    // The light naturally shifts colors as it spreads outward
    vec3 color = mix(redBase, blueAccent, sin(radius * 15.0 - uTime) * 0.5 + 0.5);
    
    // Base caustic intensity
    vec3 finalColor = color * caustic * 2.5;

    // The physical cube casts a dark shadow directly in the center, 
    // with the light bending AROUND it (optical refraction)
    float cubeShadow = smoothstep(0.05, 0.15, radius);
    finalColor *= cubeShadow;

    // --- THE CLICK REACTOR FLASH ---
    // When the cube is clicked, the floor ignites with the same blinding energy!
    finalColor += vec3(1.0, 0.8, 0.9) * caustic * uClickWave * 4.0;
    
    // Ambient global illumination boost from the click
    finalColor += vec3(0.8, 0.1, 0.2) * mask * uClickWave * 0.5;

    gl_FragColor = vec4(finalColor, mask * (0.6 + uClickWave));
}
`

export default function CausticFloor({ clickWaveRef }) {
  const { geometry, material } = useMemo(() => {
    const geo = new PlaneGeometry(12, 12)
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uClickWave: { value: 0 }
      }
    })
    return { geometry: geo, material: mat }
  }, [])

  useFrame((state) => {
    if (material && clickWaveRef.current) {
      material.uniforms.uTime.value = state.clock.elapsedTime
      material.uniforms.uClickWave.value = clickWaveRef.current.value
    }
  })

  return (
    <mesh 
      geometry={geometry} 
      material={material} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -2.0, 0]} // Positioned beautifully below the cube
    />
  )
}