import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, BufferAttribute, BufferGeometry, ShaderMaterial } from 'three'
import gsap from 'gsap'
import { worldState } from '../../core/world/worldState'
import { internalDepthFragmentShader, internalDepthVertexShader } from '../../shaders/cube/internalDepth.glsl.js'
import { CUBE_HALF } from './cubeEdges'
import { useExperience, MODES } from '../../stores/useExperience'

function createInnerCubeGeometry(size) {
  // ... Keep your exact same geometry creation code here ...
  const h = size * 0.5
  const vertices = new Float32Array([
    -h, -h, h, h, -h, h, h, h, h, -h, h, h,
    h, -h, -h, -h, -h, -h, -h, h, -h, h, h, -h,
    h, -h, h, h, -h, -h, h, h, -h, h, h, h,
    -h, -h, -h, -h, -h, h, -h, h, h, -h, h, -h,
    -h, h, h, h, h, h, h, h, -h, -h, h, -h,
    -h, -h, -h, h, -h, -h, h, -h, h, -h, -h, h,
  ])

  const uvs = new Float32Array([
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1,
  ])

  const indices = [
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23,
  ]

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

export default function InternalDepth() {
  const meshRef = useRef(null)
  const mode = useExperience(state => state.mode)
  const exploreDriver = useRef({ value: 0 })

  const geometry = useMemo(() => createInnerCubeGeometry(CUBE_HALF * 1.85), [])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: internalDepthVertexShader,
        fragmentShader: internalDepthFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.55 },
          uExplore: { value: 0 }, // Initialized uniform
        },
        transparent: true,
        depthWrite: false,
        side: BackSide,
      }),
    [],
  )

  useEffect(() => {
    const isExplore = mode === MODES.EXPLORE
    
    // ALWAYS KILL ZOMBIE TWEENS BEFORE CREATING NEW ONES
    gsap.killTweensOf(exploreDriver.current)
    
    gsap.to(exploreDriver.current, {
      value: isExplore ? 1 : 0,
      duration: 1.5,
      ease: 'power3.inOut'
    })
    
    return () => gsap.killTweensOf(exploreDriver.current)
  }, [mode])

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uOpacity.value =
      worldState.shellOpacity * (0.35 + worldState.energy * 0.45)
    
    // Pipe the GSAP value straight into the shader
    material.uniforms.uExplore.value = exploreDriver.current.value
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}