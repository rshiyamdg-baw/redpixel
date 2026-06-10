export const rayVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vViewDir;

void main() {
  vUv = uv;
  
  // Accurately compute normals for InstancedMesh to allow 3D lighting!
  mat4 instanceMat = modelMatrix * instanceMatrix;
  vec3 worldPos = (instanceMat * vec4(position, 1.0)).xyz;
  
  vViewDir = normalize(cameraPosition - worldPos);
  vWorldNormal = normalize((instanceMat * vec4(normal, 0.0)).xyz);

  gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}
`

export const rayFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;

varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vViewDir;

void main() {
  // Expensive 3D Fresnel Glow! The edges of the cylinder glow brighter than the center.
  float fresnel = pow(1.0 - abs(dot(vWorldNormal, vViewDir)), 1.5);

  float t = uTime * 3.0;
  // Scrolling data stream logic moving upward along the cone (vUv.y)
  float dataStream = sin(vUv.y * 30.0 - t * 4.0) * 0.5 + 0.5;
  float microData = fract(sin(dot(vUv, vec2(12.9898, 78.233)) + t) * 43758.5453);

  // Fade out smoothly at the base (0.0) and the tip (1.0)
  float fade = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.3, vUv.y);
  
  // Sharp inner core based on the viewing angle
  float core = smoothstep(0.7, 1.0, fresnel);

  vec3 redHot = vec3(1.0, 0.2, 0.3);
  vec3 deepCrimson = vec3(0.8, 0.0, 0.05);

  // Blend colors for a fiery, complex volume
  vec3 color = mix(deepCrimson, redHot, core + dataStream * 0.5);

  // Combine our complex math into the final alpha transparency
  float alpha = (dataStream * 0.4 + microData * 0.2 + core * 0.8) * fade * fresnel * uIntensity * 1.5;

  gl_FragColor = vec4(color * 2.0, alpha);
}
`