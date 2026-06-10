import { noiseGLSL } from '../common/noise.glsl.js'

export const internalDepthVertexShader = /* glsl */ `
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vViewPos;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const internalDepthFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform float uExplore;

varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vViewPos;

${noiseGLSL}

void main() {
  vec3 viewDir = normalize(vViewPos);

  // Vastly slowed down time evolution for an elegant, premium feel
  float t = uTime * 0.12;

  // Low-frequency fluid dynamics (No more cheap static!)
  float fluid1 = snoise(vWorldPosition * 1.2 + viewDir * 0.5 + vec3(t)) * 0.5 + 0.5;
  float fluid2 = snoise(vWorldPosition * 1.8 - viewDir * 0.3 - vec3(t * 1.3)) * 0.5 + 0.5;
  float blend = smoothstep(0.3, 0.7, fluid1 * 0.6 + fluid2 * 0.4);

  // The true Redpixel Palette: Deep Midnight Cyber-Blue into Rich Crimson
  vec3 colorBlue = vec3(0.01, 0.04, 0.15); 
  vec3 colorRed = vec3(0.4, 0.02, 0.05);  
  vec3 baseColor = mix(colorBlue, colorRed, blend);

  // A subtle, elegant crimson pulse that awakens during Explore Mode
  float explorePulse = snoise(vWorldPosition * 1.5 - uTime * 0.3) * uExplore;
  vec3 exploreGlow = vec3(0.8, 0.05, 0.1) * explorePulse * 0.6;

  // Soft spherical vignette to contain the magic deep inside the cube
  float dist = length(vUv - 0.5);
  float vignette = smoothstep(0.7, 0.2, dist);

  // Ultra-smooth alpha blending
  float alpha = (0.15 + blend * 0.35 + explorePulse * 0.25) * vignette * uOpacity;

  gl_FragColor = vec4(baseColor + exploreGlow, alpha);
}
`