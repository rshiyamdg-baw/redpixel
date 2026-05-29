import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  PointsMaterial,
} from 'three'
import { worldState } from '../../core/world/worldState'
import { CUBE_EDGES } from './cubeEdges'

const PARTICLES_PER_EDGE = 10

function createEdgeParticles() {
  const positions = new Float32Array(CUBE_EDGES.length * PARTICLES_PER_EDGE * 3)
  const offsets = new Float32Array(CUBE_EDGES.length * PARTICLES_PER_EDGE)
  const speeds = new Float32Array(CUBE_EDGES.length * PARTICLES_PER_EDGE)

  let index = 0

  for (const [start, end] of CUBE_EDGES) {
    for (let i = 0; i < PARTICLES_PER_EDGE; i += 1) {
      const t = i / PARTICLES_PER_EDGE
      const vertexIndex = index * 3

      positions[vertexIndex] = start[0] + (end[0] - start[0]) * t
      positions[vertexIndex + 1] = start[1] + (end[1] - start[1]) * t
      positions[vertexIndex + 2] = start[2] + (end[2] - start[2]) * t

      offsets[index] = Math.random()
      speeds[index] = 0.15 + Math.random() * 0.35
      index += 1
    }
  }

  return { positions, offsets, speeds }
}

export default function EdgeParticles() {
  const pointsRef = useRef(null)
  const particleData = useMemo(() => createEdgeParticles(), [])

  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(particleData.positions, 3))
    return geo
  }, [particleData])

  useFrame((state) => {
    if (!pointsRef.current) return

    const positions = pointsRef.current.geometry.attributes.position.array
    const time = state.clock.elapsedTime
    const speedMultiplier = 0.4 + worldState.particleEnergy * 1.2
    let vertex = 0
    let edgeIndex = 0

    for (const [start, end] of CUBE_EDGES) {
      for (let i = 0; i < PARTICLES_PER_EDGE; i += 1) {
        const particleIndex = edgeIndex * PARTICLES_PER_EDGE + i
        const t =
          (particleData.offsets[particleIndex] +
            time * particleData.speeds[particleIndex] * speedMultiplier) %
          1

        positions[vertex] = start[0] + (end[0] - start[0]) * t
        positions[vertex + 1] = start[1] + (end[1] - start[1]) * t
        positions[vertex + 2] = start[2] + (end[2] - start[2]) * t
        vertex += 3
      }
      edgeIndex += 1
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true

    const material = pointsRef.current.material
    material.opacity = 0.2 + worldState.particleEnergy * 0.75
    material.size = 0.02 + worldState.energy * 0.04
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        color="#e9d5ff"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
