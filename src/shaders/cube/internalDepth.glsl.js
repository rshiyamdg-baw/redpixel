import { noiseGLSL } from '../common/noise.glsl.js'

export const internalDepthVertexShader = /* glsl */ `
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const internalDepthFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uOpacity;

varying vec3 vWorldPosition;
varying vec2 vUv;

${noiseGLSL}

void main() {
  float n1 = snoise(vWorldPosition * 4.0 + vec3(uTime * 0.15));
  float n2 = snoise(vWorldPosition * 8.0 - vec3(uTime * 0.1));
  float depth = n1 * 0.65 + n2 * 0.35;
  depth = depth * 0.5 + 0.5;

  float vignette = 1.0 - length(vUv - 0.5) * 1.4;
  vignette = clamp(vignette, 0.0, 1.0);

  vec3 deep = vec3(0.04, 0.0, 0.12);
  vec3 glow = vec3(0.67, 0.23, 1.0);
  vec3 color = mix(deep, glow, depth * vignette);

  gl_FragColor = vec4(color, uOpacity * (0.2 + depth * 0.35));
}
`
