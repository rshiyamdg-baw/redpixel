import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { Color } from 'three'
import { worldState } from '../../core/world/worldState'
import { CUBE_EDGES } from './cubeEdges'

const lineColor = new Color()

export default function StructuralLines() {
  const lineRef = useRef(null)
  const { size } = useThree()

  const line = useMemo(() => {
    const positions = CUBE_EDGES.flatMap(([start, end]) => [...start, ...end])

    const geometry = new LineGeometry()
    geometry.setPositions(positions)

    const material = new LineMaterial({
      color: 0xff3333,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      worldUnits: false,
    })

    return new Line2(geometry, material)
  }, [])

  useLayoutEffect(() => {
    line.material.resolution.set(size.width, size.height)
    line.computeLineDistances()
  }, [line, size])

  useFrame(() => {
    if (!lineRef.current) return

    const material = lineRef.current.material
    const unfold = 1 + worldState.unfold * 0.4
    const densityAlpha = 0.25 + worldState.lineDensity * 0.75

    lineRef.current.scale.setScalar(unfold)
    material.linewidth = worldState.lineWidth
    material.opacity = densityAlpha
    lineColor.setHex(worldState.lineColor)
    material.color.copy(lineColor)
    material.resolution.set(size.width, size.height)
  })

  return <primitive ref={lineRef} object={line} />
}
