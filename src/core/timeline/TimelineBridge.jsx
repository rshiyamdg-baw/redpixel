import { useFrame, useThree } from '@react-three/fiber'
import { worldState } from '../world/worldState'

export default function TimelineBridge() {
  const camera = useThree((state) => state.camera)

  useFrame(() => {
    camera.position.set(worldState.cameraX, worldState.cameraY, worldState.cameraZ)
    camera.lookAt(0, 0, 0)
  })

  return null
}
