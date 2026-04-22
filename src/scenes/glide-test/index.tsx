import {
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  TextShape,
  pointerEventsSystem,
  InputAction
} from '@dcl/sdk/ecs'
import { Color4, Vector3, Quaternion } from '@dcl/sdk/math'
import { movePlayerTo } from '~system/RestrictedActions'
import { sceneEntities } from '../../utils/entity'

// Drop altitudes in meters. Low values let you test double-jump without
// actually entering glide; higher values give you time for the full
// Gliding_Start → Gliding_Idle → Gliding_End chain. Capped below the scene's
// vertical limit (~110 m for a 48-parcel scene).
const HEIGHTS: number[] = [5, 15, 30, 60, 100]

const PAD_COLORS: Color4[] = [
  Color4.create(0.2, 0.8, 0.4, 1), //   5 m — green
  Color4.create(0.3, 0.7, 0.9, 1), //  15 m — cyan
  Color4.create(0.95, 0.85, 0.25, 1), //  30 m — yellow
  Color4.create(0.95, 0.5, 0.2, 1), //  60 m — orange
  Color4.create(0.9, 0.25, 0.25, 1) // 100 m — red
]

function createTeleportPad(padPos: Vector3, height: number, color: Color4): void {
  // Base plinth
  const pad = sceneEntities.addEntity()
  Transform.create(pad, {
    position: padPos,
    scale: Vector3.create(2.6, 0.3, 2.6)
  })
  MeshRenderer.setBox(pad)
  MeshCollider.setBox(pad)
  Material.setPbrMaterial(pad, {
    albedoColor: color,
    emissiveColor: color,
    emissiveIntensity: 0.6
  })

  // Clickable top surface — sits above the plinth so the pointer icon reads
  // nicely and the plinth itself is a clean visual cue. Clicking teleports
  // the player to (padPos.x, height, padPos.z) so when they fall back down
  // they land on the same pad they launched from.
  pointerEventsSystem.onPointerDown(
    {
      entity: pad,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: `Teleport to ${height} m`,
        maxDistance: 15,
        showFeedback: true
      }
    },
    () => {
      movePlayerTo({
        newRelativePosition: Vector3.create(padPos.x, height, padPos.z)
      })
        .then()
        .catch(console.error)
    }
  )

  // Floating altitude label above the pad
  const label = sceneEntities.addEntity()
  Transform.create(label, {
    position: Vector3.create(padPos.x, padPos.y + 2.2, padPos.z),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(label, {
    text: `${height} m`,
    fontSize: 5,
    textColor: Color4.White(),
    outlineWidth: 0.1,
    outlineColor: Color4.Black()
  })

  // Tiny marker disc floating at the drop altitude, same color as the pad.
  // Purely visual — gives you a line-of-sight "you will appear here" cue
  // and a sense of how high 100 m really is.
  const marker = sceneEntities.addEntity()
  Transform.create(marker, {
    position: Vector3.create(padPos.x, height, padPos.z),
    scale: Vector3.create(1.8, 0.15, 1.8)
  })
  MeshRenderer.setCylinder(marker)
  Material.setPbrMaterial(marker, {
    albedoColor: color,
    emissiveColor: color,
    emissiveIntensity: 0.9
  })
}

export function main(): void {
  console.log('[glide-test] scene loaded')

  // Ground plate for the launch area
  const ground = sceneEntities.addEntity()
  Transform.create(ground, {
    position: Vector3.create(8, 0, 8),
    scale: Vector3.create(20, 0.1, 20)
  })
  MeshRenderer.setBox(ground)
  MeshCollider.setBox(ground)
  Material.setPbrMaterial(ground, {
    albedoColor: Color4.create(0.22, 0.22, 0.25, 1)
  })

  // Title / instructions panel — faces the default spawn (parcel 0,0 corner).
  const title = sceneEntities.addEntity()
  Transform.create(title, {
    position: Vector3.create(8, 4.5, 2),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(title, {
    text:
      'GLIDE TEST\n' +
      '\n' +
      'Click a pad to teleport straight up to that altitude.\n' +
      'After the drop: press JUMP twice to double-jump,\n' +
      'then press JUMP a third time in the air to open the glider.',
    fontSize: 2.8,
    textColor: Color4.White(),
    outlineWidth: 0.1,
    outlineColor: Color4.Black()
  })

  // Pads arranged in a row, 3 m apart, centered around x=10.
  const padCenterX = 10
  const padSpacing = 3
  const startX = padCenterX - ((HEIGHTS.length - 1) * padSpacing) / 2
  const padZ = 10

  HEIGHTS.forEach((height, i) => {
    const padPos = Vector3.create(startX + i * padSpacing, 0.2, padZ)
    createTeleportPad(padPos, height, PAD_COLORS[i])
  })
}
