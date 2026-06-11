// import { useEffect, useMemo, useRef } from 'react'
// import { useFrame } from '@react-three/fiber'
// import {
//   AdditiveBlending,
//   DoubleSide,
//   InstancedMesh,
//   Object3D,
//   PlaneGeometry,
//   Quaternion,
//   ShaderMaterial,
//   Vector3,
// } from 'three'
// import { worldState } from '../../core/world/worldState'
// import {
//   rayFragmentShader,
//   rayVertexShader,
// } from '../../shaders/rays/rayFlicker.glsl.js'
// import { CUBE_FACE_NORMALS, CUBE_HALF } from './cubeEdges'

// const RAYS_PER_FACE = 4
// const RAY_COUNT = CUBE_FACE_NORMALS.length * RAYS_PER_FACE
// const dummy = new Object3D()
// const normal = new Vector3()
// const up = new Vector3(0, 1, 0)
// const tangent = new Vector3()
// const bitangent = new Vector3()
// const lookAt = new Quaternion()

// export default function CubeRays() {
//   const meshRef = useRef(null)

//   const { geometry, material } = useMemo(() => {
//     const geo = new PlaneGeometry(0.04, 1.6, 1, 8)
//     const mat = new ShaderMaterial({
//       vertexShader: rayVertexShader,
//       fragmentShader: rayFragmentShader,
//       uniforms: {
//         uTime: { value: 0 },
//         uIntensity: { value: 0.12 },
//       },
//       transparent: true,
//       depthWrite: false,
//       blending: AdditiveBlending,
//       side: DoubleSide,
//     })

//     return { geometry: geo, material: mat }
//   }, [])

//   useEffect(() => {
//     if (!meshRef.current) return

//     let index = 0

//     for (const faceNormal of CUBE_FACE_NORMALS) {
//       normal.set(...faceNormal)

//       for (let i = 0; i < RAYS_PER_FACE; i += 1) {
//         if (Math.abs(normal.y) > 0.9) {
//           tangent.set(1, 0, 0)
//         } else {
//           tangent.set(0, 1, 0)
//         }

//         bitangent.crossVectors(normal, tangent).normalize()
//         tangent.crossVectors(bitangent, normal).normalize()

//         const offsetU = (Math.random() - 0.5) * CUBE_HALF * 1.4
//         const offsetV = (Math.random() - 0.5) * CUBE_HALF * 1.4

//         dummy.position
//           .copy(normal)
//           .multiplyScalar(CUBE_HALF + 0.02)
//           .addScaledVector(tangent, offsetU)
//           .addScaledVector(bitangent, offsetV)

//         lookAt.setFromUnitVectors(up, normal)
//         dummy.quaternion.copy(lookAt)

//         const length = 0.8 + Math.random() * 0.9
//         dummy.scale.set(0.6 + Math.random() * 0.5, length, 1)
//         dummy.updateMatrix()

//         meshRef.current.setMatrixAt(index, dummy.matrix)
//         index += 1
//       }
//     }

//     meshRef.current.instanceMatrix.needsUpdate = true
//   }, [])

//   useFrame((state) => {
//     material.uniforms.uTime.value = state.clock.elapsedTime
//     material.uniforms.uIntensity.value = worldState.rayIntensity

//     if (meshRef.current) {
//       meshRef.current.visible = worldState.rayIntensity > 0.05
//     }
//   })

//   return (
//     <instancedMesh
//       ref={meshRef}
//       args={[geometry, material, RAY_COUNT]}
//       frustumCulled={false}
//     />
//   )
// }
