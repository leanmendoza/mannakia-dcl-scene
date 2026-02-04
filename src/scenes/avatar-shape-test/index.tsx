import { AvatarShape, engine, Transform, TextShape, Entity } from '@dcl/sdk/ecs'
import ReactEcs, { Button, Label, type JSX } from '@dcl/sdk/react-ecs'
import { UiBox } from '../../utils/ui/box'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { sceneEntities } from '../../utils/entity'

// Import JSON data
import wearablesData from '../../../assets/json/wearables_by_collection.json'
import emotesData from '../../../assets/json/emotes_by_collection.json'

// Types for JSON data
type WearableItem = {
  id: string
  category: string
  name: string
  hides: string[]
}

type EmoteItem = {
  id: string
  category: string
  name: string
  loop: boolean
}

// Flatten wearables and emotes from all collections
const ALL_WEARABLES: WearableItem[] = Object.values(wearablesData).flat() as WearableItem[]
const ALL_EMOTES: EmoteItem[] = Object.values(emotesData).flat() as EmoteItem[]

// Filter wearables by category for show_only_wearables test (visible items)
const VISIBLE_WEARABLES = ALL_WEARABLES.filter(
  (w) =>
    ['upper_body', 'lower_body', 'feet', 'helmet', 'hat', 'top_head', 'mask', 'eyewear', 'tiara', 'earring', 'hands_wear'].includes(w.category) &&
    !w.id.includes('base-avatars') // Prefer collection wearables
)

// Store references for UI updates
let npcWithExpressionTrigger: Entity | null = null
let npcWithShowOnlyWearables: Entity | null = null
let expressionTimestamp = 0
let currentEmoteIndex = 0
let currentWearableIndex = 0
let currentEmoteName = 'wave'
let currentWearableName = ''

const DEFAULT_EMOTES = ['wave', 'clap', 'dance', 'raiseHand', 'fistpump', 'shrug']

// Default wearables for a male avatar
const MALE_WEARABLES = [
  'urn:decentraland:off-chain:base-avatars:eyes_00',
  'urn:decentraland:off-chain:base-avatars:eyebrows_00',
  'urn:decentraland:off-chain:base-avatars:mouth_00',
  'urn:decentraland:off-chain:base-avatars:casual_hair_01',
  'urn:decentraland:off-chain:base-avatars:beard',
  'urn:decentraland:off-chain:base-avatars:m_greenflipflops',
  'urn:decentraland:off-chain:base-avatars:soccer_pants',
  'urn:decentraland:off-chain:base-avatars:green_hoodie'
]

// Initial wearable for show_only_wearables
let currentShowOnlyWearable =
  VISIBLE_WEARABLES.length > 0
    ? VISIBLE_WEARABLES[0].id
    : 'urn:decentraland:matic:collections-v2:0x90e5cb2d673699be8f28d339c818a0b60144c494:0'

export function main(): void {
  console.log(`Loaded ${ALL_WEARABLES.length} wearables from collections`)
  console.log(`Loaded ${ALL_EMOTES.length} emotes from collections`)
  console.log(`Filtered ${VISIBLE_WEARABLES.length} visible wearables for show_only_wearables`)

  createLabelEntity(
    Vector3.create(4, 2.5, 4),
    'NPC 1: Basic AvatarShape\n(default, hides nickname)'
  )
  createLabelEntity(
    Vector3.create(8, 2.5, 4),
    'NPC 2: show_only_wearables=true\n(random wearable from collections)'
  )
  createLabelEntity(
    Vector3.create(12, 2.5, 4),
    'NPC 3: expression_trigger\n(random emotes from collections)'
  )
  createLabelEntity(
    Vector3.create(4, 2.5, 8),
    'NPC 4: Female avatar\n(different wearables)'
  )

  // NPC 1: Basic AvatarShape - tests that nickname is hidden
  const npc1 = sceneEntities.addEntity()
  Transform.create(npc1, {
    position: Vector3.create(4, 0, 4),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  AvatarShape.create(npc1, {
    id: 'npc-basic',
    name: 'Basic NPC',
    bodyShape: 'urn:decentraland:off-chain:base-avatars:BaseMale',
    wearables: MALE_WEARABLES,
    emotes: [],
    forceRender: [],
    skinColor: { r: 0.8, g: 0.6, b: 0.5 },
    hairColor: { r: 0.3, g: 0.2, b: 0.1 },
    eyeColor: { r: 0.2, g: 0.5, b: 0.7 }
  })

  // NPC 2: show_only_wearables - should show only the wearable, no body
  const npc2 = sceneEntities.addEntity()
  Transform.create(npc2, {
    position: Vector3.create(8, 0, 4),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  AvatarShape.create(npc2, {
    id: 'npc-show-only',
    name: 'ShowOnly NPC',
    bodyShape: 'urn:decentraland:off-chain:base-avatars:BaseMale',
    wearables: [currentShowOnlyWearable],
    emotes: [],
    forceRender: [],
    showOnlyWearables: true,
    skinColor: { r: 0.9, g: 0.7, b: 0.6 },
    hairColor: { r: 0.8, g: 0.1, b: 0.1 },
    eyeColor: { r: 0.3, g: 0.6, b: 0.3 }
  })
  npcWithShowOnlyWearables = npc2
  if (VISIBLE_WEARABLES.length > 0) {
    currentWearableName = VISIBLE_WEARABLES[0].name
  }

  // NPC 3: expression_trigger_id and expression_trigger_timestamp
  const npc3 = sceneEntities.addEntity()
  Transform.create(npc3, {
    position: Vector3.create(12, 0, 4),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  AvatarShape.create(npc3, {
    id: 'npc-emote',
    name: 'Emote NPC',
    bodyShape: 'urn:decentraland:off-chain:base-avatars:BaseMale',
    wearables: MALE_WEARABLES,
    emotes: [],
    forceRender: [],
    skinColor: { r: 0.6, g: 0.4, b: 0.3 },
    hairColor: { r: 0.1, g: 0.1, b: 0.1 },
    eyeColor: { r: 0.1, g: 0.3, b: 0.1 },
    expressionTriggerId: 'wave',
    expressionTriggerTimestamp: expressionTimestamp
  })
  npcWithExpressionTrigger = npc3

  // NPC 4: Another female avatar with different wearables
  const npc4 = sceneEntities.addEntity()
  Transform.create(npc4, {
    position: Vector3.create(4, 0, 8),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  AvatarShape.create(npc4, {
    id: 'npc-female',
    name: 'Female NPC',
    bodyShape: 'urn:decentraland:off-chain:base-avatars:BaseFemale',
    wearables: [
      'urn:decentraland:off-chain:base-avatars:f_eyes_00',
      'urn:decentraland:off-chain:base-avatars:f_eyebrows_00',
      'urn:decentraland:off-chain:base-avatars:f_mouth_00',
      'urn:decentraland:off-chain:base-avatars:standard_hair',
      'urn:decentraland:off-chain:base-avatars:f_simple_yellow_tshirt',
      'urn:decentraland:off-chain:base-avatars:f_brown_trousers',
      'urn:decentraland:off-chain:base-avatars:bun_shoes'
    ],
    emotes: [],
    forceRender: [],
    skinColor: { r: 0.95, g: 0.75, b: 0.65 },
    hairColor: { r: 0.9, g: 0.6, b: 0.1 },
    eyeColor: { r: 0.4, g: 0.2, b: 0.1 }
  })

  console.log('AvatarShape test scene loaded!')
  console.log('- NPC 1 at (4,0,4): Basic avatar, nickname should be hidden')
  console.log('- NPC 2 at (8,0,4): show_only_wearables=true with random wearables')
  console.log('- NPC 3 at (12,0,4): expression_trigger with random emotes')
  console.log('- NPC 4 at (4,0,8): Female avatar with different wearables')
}

function createLabelEntity(position: Vector3, text: string): void {
  const labelEntity = sceneEntities.addEntity()
  Transform.create(labelEntity, {
    position,
    scale: Vector3.create(0.5, 0.5, 0.5)
  })
  TextShape.create(labelEntity, {
    text,
    fontSize: 3,
    textColor: Color4.White()
  })
}

function triggerEmote(emoteId: string, emoteName: string): void {
  if (!npcWithExpressionTrigger) return

  expressionTimestamp++
  const mutableShape = AvatarShape.getMutable(npcWithExpressionTrigger)
  mutableShape.expressionTriggerId = emoteId
  mutableShape.expressionTriggerTimestamp = expressionTimestamp
  currentEmoteName = emoteName

  console.log(`Triggered emote: ${emoteName} (${emoteId}) with timestamp: ${expressionTimestamp}`)
}

function cycleDefaultEmote(): void {
  const emote = DEFAULT_EMOTES[currentEmoteIndex]
  triggerEmote(emote, emote)
  currentEmoteIndex = (currentEmoteIndex + 1) % DEFAULT_EMOTES.length
}

function triggerRandomCollectionEmote(): void {
  if (ALL_EMOTES.length === 0) {
    console.log('No collection emotes available')
    return
  }
  const randomIndex = Math.floor(Math.random() * ALL_EMOTES.length)
  const emote = ALL_EMOTES[randomIndex]
  triggerEmote(emote.id, emote.name)
}

function cycleShowOnlyWearable(): void {
  if (!npcWithShowOnlyWearables || VISIBLE_WEARABLES.length === 0) return

  currentWearableIndex = (currentWearableIndex + 1) % VISIBLE_WEARABLES.length
  const wearable = VISIBLE_WEARABLES[currentWearableIndex]
  currentShowOnlyWearable = wearable.id
  currentWearableName = wearable.name

  const mutableShape = AvatarShape.getMutable(npcWithShowOnlyWearables)
  mutableShape.wearables = [currentShowOnlyWearable]

  console.log(`Changed show_only_wearables to: ${wearable.name} (${wearable.category})`)
}

function randomShowOnlyWearable(): void {
  if (!npcWithShowOnlyWearables || VISIBLE_WEARABLES.length === 0) return

  const randomIndex = Math.floor(Math.random() * VISIBLE_WEARABLES.length)
  const wearable = VISIBLE_WEARABLES[randomIndex]
  currentShowOnlyWearable = wearable.id
  currentWearableName = wearable.name
  currentWearableIndex = randomIndex

  const mutableShape = AvatarShape.getMutable(npcWithShowOnlyWearables)
  mutableShape.wearables = [currentShowOnlyWearable]

  console.log(`Random show_only_wearables: ${wearable.name} (${wearable.category})`)
}

export function UI(): JSX.Element {
  return (
    <UiBox width={400} height={420} uiTransform={{ padding: 10 }}>
      <Label
        value="AvatarShape Test Scene"
        fontSize={18}
        uiTransform={{ height: 30 }}
      />
      <Label value="Testing:" fontSize={14} uiTransform={{ height: 25 }} />
      <Label
        value="- show_only_wearables (random from collections)"
        fontSize={12}
        uiTransform={{ height: 20 }}
      />
      <Label
        value="- expression_trigger_id/timestamp (random emotes)"
        fontSize={12}
        uiTransform={{ height: 20 }}
      />
      <Label
        value="- nickname hidden for NPCs"
        fontSize={12}
        uiTransform={{ height: 20 }}
      />

      {/* show_only_wearables controls */}
      <Label
        value={`\nshow_only_wearables (NPC 2):`}
        fontSize={14}
        uiTransform={{ height: 30, margin: { top: 5 } }}
      />
      <Button
        value="Next Wearable"
        fontSize={12}
        uiTransform={{ height: 30, margin: { top: 3 } }}
        onMouseDown={cycleShowOnlyWearable}
      />
      <Button
        value="Random Wearable"
        fontSize={12}
        uiTransform={{ height: 30, margin: { top: 3 } }}
        onMouseDown={randomShowOnlyWearable}
      />
      <Label
        value={`Current: ${currentWearableName.substring(0, 30)}`}
        fontSize={10}
        uiTransform={{ height: 18 }}
      />

      {/* Expression trigger controls */}
      <Label
        value={`\nExpression Trigger (NPC 3):`}
        fontSize={14}
        uiTransform={{ height: 30, margin: { top: 5 } }}
      />
      <Button
        value="Cycle Default Emote"
        fontSize={12}
        uiTransform={{ height: 30, margin: { top: 3 } }}
        onMouseDown={cycleDefaultEmote}
      />
      <Button
        value="Random Collection Emote"
        fontSize={12}
        uiTransform={{ height: 30, margin: { top: 3 } }}
        onMouseDown={triggerRandomCollectionEmote}
      />
      <Label
        value={`Current: ${currentEmoteName.substring(0, 30)}`}
        fontSize={10}
        uiTransform={{ height: 18 }}
      />
      <Label
        value={`Timestamp: ${expressionTimestamp}`}
        fontSize={10}
        uiTransform={{ height: 18 }}
      />
    </UiBox>
  )
}
