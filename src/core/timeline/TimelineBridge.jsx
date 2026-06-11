import { useFrame, useThree } from '@react-three/fiber'
import { worldState } from '../world/worldState'
 
console.log(worldState);
export default function TimelineBridge() {
  const camera = useThree((state) => state.camera)

  useFrame(() => {
    camera.position.set(worldState.cameraX, worldState.cameraY, worldState.cameraZ)
    camera.lookAt(
      worldState.targetX, 
      worldState.targetY, 
      worldState.targetZ
    );
  })

  return null
}
