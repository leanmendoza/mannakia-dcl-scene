import {
  engine,
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  TextShape,
  pointerEventsSystem,
  InputAction,
  AvatarLocomotionSettings
} from '@dcl/sdk/ecs'
import { Color4, Vector3, Quaternion } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, type JSX, UiEntity } from '@dcl/sdk/react-ecs'
import { UiBox } from '../../utils/ui/box'
import { sceneEntities } from '../../utils/entity'

// Default values (matching Godot's defaults)
const DEFAULTS = {
  walkSpeed: 1.5,
  jogSpeed: 8.0,
  runSpeed: 11.0,
  jumpHeight: 1.8,
  runJumpHeight: 1.8,
  hardLandingCooldown: 0.0
}

// Current settings state for UI display
let currentSettings = {
  walkSpeed: undefined as number | undefined,
  jogSpeed: undefined as number | undefined,
  runSpeed: undefined as number | undefined,
  jumpHeight: undefined as number | undefined,
  runJumpHeight: undefined as number | undefined,
  hardLandingCooldown: undefined as number | undefined,
  zoneName: 'Default Zone'
}

// Zone configurations
const zones = [
  {
    name: 'Default Zone',
    position: Vector3.create(8, 0.1, 4),
    color: Color4.Gray(),
    settings: {} // Empty = use all defaults
  },
  {
    name: 'Slow Walk Zone',
    position: Vector3.create(4, 0.1, 8),
    color: Color4.create(0.2, 0.5, 0.8, 1),
    settings: {
      walkSpeed: 0.5,
      jogSpeed: 2.0,
      runSpeed: 4.0
    }
  },
  {
    name: 'Super Speed Zone',
    position: Vector3.create(12, 0.1, 8),
    color: Color4.create(1, 0.8, 0.2, 1),
    settings: {
      walkSpeed: 4.0,
      jogSpeed: 16.0,
      runSpeed: 25.0
    }
  },
  {
    name: 'High Jump Zone',
    position: Vector3.create(8, 0.1, 12),
    color: Color4.create(0.2, 0.8, 0.3, 1),
    settings: {
      jumpHeight: 5.0,
      runJumpHeight: 8.0
    }
  },
  {
    name: 'Moon Gravity Zone',
    position: Vector3.create(4, 0.1, 12),
    color: Color4.create(0.8, 0.3, 0.8, 1),
    settings: {
      walkSpeed: 2.0,
      jogSpeed: 6.0,
      runSpeed: 10.0,
      jumpHeight: 4.0,
      runJumpHeight: 6.0
    }
  },
  {
    name: 'Hard Landing Zone',
    position: Vector3.create(12, 0.1, 12),
    color: Color4.create(0.8, 0.2, 0.2, 1),
    settings: {
      jumpHeight: 3.0,
      runJumpHeight: 4.0,
      hardLandingCooldown: 2.0
    }
  }
]

function applySettings(settings: typeof zones[0]['settings'], zoneName: string): void {
  currentSettings = {
    walkSpeed: settings.walkSpeed,
    jogSpeed: settings.jogSpeed,
    runSpeed: settings.runSpeed,
    jumpHeight: settings.jumpHeight,
    runJumpHeight: settings.runJumpHeight,
    hardLandingCooldown: settings.hardLandingCooldown,
    zoneName
  }

  // Apply to root entity
  if (Object.keys(settings).length === 0) {
    // Remove component to reset to defaults (only if it exists)
    if (AvatarLocomotionSettings.has(engine.RootEntity)) {
      AvatarLocomotionSettings.deleteFrom(engine.RootEntity)
    }
  } else {
    AvatarLocomotionSettings.createOrReplace(engine.RootEntity, settings)
  }

  console.log(`Applied locomotion settings for zone: ${zoneName}`, settings)
}

function resetToDefaults(): void {
  applySettings({}, 'Default Zone')
}

function createZoneButton(zone: typeof zones[0]): void {
  // Create floor platform
  const platform = sceneEntities.addEntity()
  Transform.create(platform, {
    position: zone.position,
    scale: Vector3.create(3, 0.2, 3)
  })
  MeshRenderer.setBox(platform)
  MeshCollider.setBox(platform)
  Material.setPbrMaterial(platform, {
    albedoColor: zone.color
  })

  // Create clickable button on top
  const button = sceneEntities.addEntity()
  Transform.create(button, {
    position: Vector3.create(zone.position.x, zone.position.y + 0.5, zone.position.z),
    scale: Vector3.create(1.5, 0.8, 1.5)
  })
  MeshRenderer.setBox(button)
  MeshCollider.setBox(button)
  Material.setPbrMaterial(button, {
    albedoColor: Color4.lerp(zone.color, Color4.White(), 0.3),
    emissiveColor: zone.color,
    emissiveIntensity: 0.5
  })

  // Add pointer interaction
  pointerEventsSystem.onPointerDown(
    {
      entity: button,
      opts: {
        button: InputAction.IA_PRIMARY,
        hoverText: `Apply: ${zone.name}`,
        maxDistance: 15,
        showFeedback: true
      }
    },
    () => {
      applySettings(zone.settings, zone.name)
    }
  )

  // Create label above button
  const label = sceneEntities.addEntity()
  Transform.create(label, {
    position: Vector3.create(zone.position.x, zone.position.y + 1.5, zone.position.z),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(label, {
    text: zone.name,
    fontSize: 2,
    textColor: Color4.White()
  })
}

export function main(): void {
  console.log('Locomotion Test Scene loaded')

  // Create ground
  const ground = sceneEntities.addEntity()
  Transform.create(ground, {
    position: Vector3.create(8, 0, 8),
    scale: Vector3.create(16, 0.1, 16)
  })
  MeshRenderer.setBox(ground)
  MeshCollider.setBox(ground)
  Material.setPbrMaterial(ground, {
    albedoColor: Color4.create(0.3, 0.3, 0.3, 1)
  })

  // Create info text
  const infoText = sceneEntities.addEntity()
  Transform.create(infoText, {
    position: Vector3.create(8, 3, 1),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(infoText, {
    text: 'Locomotion Settings Test\n\nClick on colored platforms to change movement settings',
    fontSize: 3,
    textColor: Color4.White()
  })

  // Create all zone buttons
  for (const zone of zones) {
    createZoneButton(zone)
  }

  // Don't apply any settings initially - let the explorer use its defaults
}

function formatValue(value: number | undefined, defaultValue: number): string {
  if (value === undefined) {
    return `${defaultValue.toFixed(1)} (default)`
  }
  return value.toFixed(1)
}

export function UI(): JSX.Element {
  return (
    <UiBox width={350} height={280} uiTransform={{ padding: 10 }}>
      <Label
        value={`Current Zone: ${currentSettings.zoneName}`}
        fontSize={18}
        color={Color4.Yellow()}
        uiTransform={{ height: 30, margin: { bottom: 5 } }}
      />
      <UiEntity
        uiTransform={{ height: 1, width: '100%', margin: { bottom: 5 } }}
        uiBackground={{ color: Color4.White() }}
      />
      <Label
        value={`Walk Speed: ${formatValue(currentSettings.walkSpeed, DEFAULTS.walkSpeed)} m/s`}
        fontSize={14}
        uiTransform={{ height: 24 }}
      />
      <Label
        value={`Jog Speed: ${formatValue(currentSettings.jogSpeed, DEFAULTS.jogSpeed)} m/s`}
        fontSize={14}
        uiTransform={{ height: 24 }}
      />
      <Label
        value={`Run Speed: ${formatValue(currentSettings.runSpeed, DEFAULTS.runSpeed)} m/s`}
        fontSize={14}
        uiTransform={{ height: 24 }}
      />
      <Label
        value={`Jump Height: ${formatValue(currentSettings.jumpHeight, DEFAULTS.jumpHeight)} m`}
        fontSize={14}
        uiTransform={{ height: 24 }}
      />
      <Label
        value={`Run Jump Height: ${formatValue(currentSettings.runJumpHeight, DEFAULTS.runJumpHeight)} m`}
        fontSize={14}
        uiTransform={{ height: 24 }}
      />
      <Label
        value={`Hard Landing Cooldown: ${formatValue(currentSettings.hardLandingCooldown, DEFAULTS.hardLandingCooldown)} s`}
        fontSize={14}
        uiTransform={{ height: 24 }}
      />
      <UiEntity
        uiTransform={{ height: 1, width: '100%', margin: { top: 5, bottom: 5 } }}
        uiBackground={{ color: Color4.White() }}
      />
      <Button
        value="Reset to Defaults"
        fontSize={14}
        uiTransform={{ height: 35, margin: { bottom: 5 } }}
        uiBackground={{ color: Color4.create(0.3, 0.5, 0.3, 1) }}
        onMouseDown={resetToDefaults}
      />
      <Label
        value="Click platforms to test different settings"
        fontSize={12}
        color={Color4.Gray()}
        uiTransform={{ height: 20 }}
      />
    </UiBox>
  )
}
