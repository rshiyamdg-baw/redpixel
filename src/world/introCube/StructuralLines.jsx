import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, CylinderGeometry, MeshStandardMaterial, Vector3, Quaternion, IcosahedronGeometry } from 'three'
import { worldState } from '../../core/world/worldState'
import { CUBE_EDGES } from './cubeEdges'

const dummy = new Object3D()
const p1 = new Vector3()
const p2 = new Vector3()
const up = new Vector3(0, 1, 0)
const quaternion = new Quaternion()

// Pre-calculate the 8 unique corners of the cube from your edges array
const uniqueVertices = []
for (const [start, end] of CUBE_EDGES) {
  for (const v of [start, end]) {
    const exists = uniqueVertices.some(
      (u) => Math.abs(u[0] - v[0]) < 0.01 && Math.abs(u[1] - v[1]) < 0.01 && Math.abs(u[2] - v[2]) < 0.01
    )
    if (!exists) uniqueVertices.push(v)
  }
}

export default function StructuralLines() {
  const edgeRef = useRef(null)
  const nodeRef = useRef(null)

  const { edgeGeo, nodeGeo, material } = useMemo(() => {
    // Hexagonal struts for a high-tech dark metal look
    const eGeo = new CylinderGeometry(0.015, 0.015, 1, 6)
    // Faceted corner nodes (Icosahedron with 0 detail)
    const nGeo = new IcosahedronGeometry(0.04, 0)
    
    // The "Solid Ground" - Obsidian metal with a Redpixel emissive core
    const mat = new MeshStandardMaterial({
      color: 0x050505,       
      roughness: 0.3,
      metalness: 0.9,
      emissive: 0xff0022,    
      emissiveIntensity: 0.0 
    })
    
    return { edgeGeo: eGeo, nodeGeo: nGeo, material: mat }
  }, [])

  useEffect(() => {
    if (!edgeRef.current || !nodeRef.current) return

    // 1. Position the 8 physical corner nodes
    uniqueVertices.forEach((v, i) => {
      dummy.position.set(...v)
      dummy.scale.setScalar(1)
      dummy.rotation.set(Math.random(), Math.random(), Math.random()) // Randomize facets
      dummy.updateMatrix()
      nodeRef.current.setMatrixAt(i, dummy.matrix)
    })
    nodeRef.current.instanceMatrix.needsUpdate = true

    // 2. Position the 12 physical edge struts
    CUBE_EDGES.forEach(([start, end], i) => {
      p1.set(...start)
      p2.set(...end)
      
      const distance = p1.distanceTo(p2)
      const center = p1.clone().lerp(p2, 0.5)
      const dir = p2.clone().sub(p1).normalize()

      dummy.position.copy(center)
      quaternion.setFromUnitVectors(up, dir)
      dummy.quaternion.copy(quaternion)
      dummy.scale.set(1, distance, 1)
      dummy.updateMatrix()
      
      edgeRef.current.setMatrixAt(i, dummy.matrix)
    })
    edgeRef.current.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(() => {
    if (!edgeRef.current || !nodeRef.current) return
    
    const unfold = 1 + worldState.unfold * 0.4
    
    edgeRef.current.scale.setScalar(unfold)
    nodeRef.current.scale.setScalar(unfold)

    // Make the chassis breathe and glow with the energy state!
    const baseEnergy = worldState.energy || 0
    material.emissiveIntensity = 0.5 + baseEnergy * 3.0
  })

  return (
    <group>
      {/* A dim ambient light so the dark metal catches the reflections beautifully */}
      <ambientLight intensity={1.5} />
      <instancedMesh ref={nodeRef} args={[nodeGeo, material, uniqueVertices.length]} frustumCulled={false} />
      <instancedMesh ref={edgeRef} args={[edgeGeo, material, CUBE_EDGES.length]} frustumCulled={false} />
    </group>
  )
}