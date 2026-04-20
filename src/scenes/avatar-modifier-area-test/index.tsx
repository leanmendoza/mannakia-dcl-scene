import ReactEcs, { Label, type JSX } from '@dcl/sdk/react-ecs'
import {
  AvatarModifierArea,
  AvatarModifierType,
  Material,
  MeshRenderer,
  TextAlignMode,
  TextShape,
  Transform
} from '@dcl/sdk/ecs'
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { sceneEntities } from '../../utils/entity'
import { UiBox } from '../../utils/ui/box'

type AreaSpec = {
  label: string
  center: Vector3
  size: Vector3
  modifiers: AvatarModifierType[]
  excludeIds?: string[]
  color: Color4
}

const AREAS: AreaSpec[] = [
  {
    label: 'DisablePassports\n(no tooltip, no profile on click)',
    center: Vector3.create(6, 0, 10),
    size: Vector3.create(5, 3, 5),
    modifiers: [AvatarModifierType.AMT_DISABLE_PASSPORTS],
    color: Color4.create(1, 0.2, 0.2, 0.35)
  },
  {
    label: 'HideAvatars\n(baseline — avatars invisible)',
    center: Vector3.create(12, 0, 10),
    size: Vector3.create(5, 3, 5),
    modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
    color: Color4.create(0.6, 0.2, 1, 0.35)
  },
  {
    label: 'Hide + DisablePassports\n(combined)',
    center: Vector3.create(18, 0, 10),
    size: Vector3.create(5, 3, 5),
    modifiers: [
      AvatarModifierType.AMT_HIDE_AVATARS,
      AvatarModifierType.AMT_DISABLE_PASSPORTS
    ],
    color: Color4.create(1, 0.6, 0.1, 0.35)
  },
  {
    label:
      'DisablePassports + exclude my wallet\n(edit source to set your address)',
    center: Vector3.create(24, 0, 10),
    size: Vector3.create(5, 3, 5),
    modifiers: [AvatarModifierType.AMT_DISABLE_PASSPORTS],
    // Replace with a specific avatar wallet to verify exclude_ids bypass
    excludeIds: ['0x0000000000000000000000000000000000000000'],
    color: Color4.create(0.2, 1, 0.4, 0.35)
  }
]

export function main(): void {
  for (const spec of AREAS) {
    // Visible floor marker
    const floor = sceneEntities.addEntity()
    MeshRenderer.setPlane(floor)
    Material.setPbrMaterial(floor, {
      albedoColor: spec.color,
      metallic: 0,
      roughness: 1
    })
    Transform.createOrReplace(floor, {
      position: Vector3.create(spec.center.x, 0.01, spec.center.z),
      rotation: Quaternion.fromEulerDegrees(90, 0, 0),
      scale: Vector3.create(spec.size.x, spec.size.z, 1)
    })

    // Label floating above the area
    const labelEntity = sceneEntities.addEntity()
    TextShape.createOrReplace(labelEntity, {
      text: spec.label,
      fontSize: 2,
      textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
      textColor: Color4.White(),
      outlineColor: Color3.Black(),
      outlineWidth: 0.2
    })
    Transform.createOrReplace(labelEntity, {
      position: Vector3.create(spec.center.x, 2.5, spec.center.z)
    })

    // Actual AvatarModifierArea
    const areaEntity = sceneEntities.addEntity()
    Transform.createOrReplace(areaEntity, {
      position: Vector3.create(
        spec.center.x,
        spec.center.y + spec.size.y / 2,
        spec.center.z
      )
    })
    AvatarModifierArea.createOrReplace(areaEntity, {
      area: spec.size,
      modifiers: spec.modifiers,
      excludeIds: spec.excludeIds ?? []
    })
  }
}

export function UI(): JSX.Element {
  return (
    <UiBox width={420} height={170} uiTransform={{ padding: 10 }}>
      <Label
        value="AvatarModifierArea test"
        fontSize={18}
        uiTransform={{ height: 28 }}
      />
      <Label
        value="Needs a 2nd player to observe."
        fontSize={14}
        uiTransform={{ height: 22 }}
      />
      <Label
        value="Red: DisablePassports → no tooltip, no profile"
        fontSize={12}
        uiTransform={{ height: 20 }}
      />
      <Label
        value="Purple: HideAvatars → invisible"
        fontSize={12}
        uiTransform={{ height: 20 }}
      />
      <Label
        value="Orange: Hide + DisablePassports"
        fontSize={12}
        uiTransform={{ height: 20 }}
      />
      <Label
        value="Green: DisablePassports with excludeIds"
        fontSize={12}
        uiTransform={{ height: 20 }}
      />
    </UiBox>
  )
}
