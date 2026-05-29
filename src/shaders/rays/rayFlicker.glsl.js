export const rayVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`

export const rayFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;

varying vec2 vUv;

void main() {
  float pulse = sin(uTime * 8.0 + vUv.y * 24.0) * 0.5 + 0.5;
  float flicker = sin(uTime * 17.0 + vUv.x * 40.0) * 0.25 + 0.75;
  float beam = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
  float fade = pow(1.0 - vUv.y, 1.8);
  float alpha = beam * fade * pulse * flicker * uIntensity;

  vec3 color = mix(vec3(0.45, 0.1, 0.95), vec3(0.85, 0.55, 1.0), pulse);
  gl_FragColor = vec4(color, alpha);
}
`
