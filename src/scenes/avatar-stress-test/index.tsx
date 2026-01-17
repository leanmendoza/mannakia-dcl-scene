import {
  AvatarShape,
  engine,
  Transform,
  Entity,
  MeshRenderer,
  Material
} from '@dcl/sdk/ecs'
import ReactEcs, { Button, Label, UiEntity, type JSX } from '@dcl/sdk/react-ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { sceneEntities } from '../../utils/entity'

// Import JSON data
import wearablesData from '../../../assets/json/wearables_by_collection.json'
import emotesData from '../../../assets/json/emotes_by_collection.json'

// Types
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

type ProfileAvatar = {
  name: string
  bodyShape: string
  wearables: string[]
  emotes: Array<{ slot: number; urn: string }>
  skinColor: { r: number; g: number; b: number }
  hairColor: { r: number; g: number; b: number }
  eyeColor: { r: number; g: number; b: number }
}

type DeploymentEntity = {
  entityId: string
  pointers: string[]
  content: Array<{ file: string; hash: string }>
  metadata: {
    avatars: Array<{
      name: string
      avatar: {
        bodyShape: string
        wearables: string[]
        emotes: Array<{ slot: number; urn: string }>
        snapshots?: { face256?: string; body?: string }
        eyes?: { color: { r: number; g: number; b: number } }
        hair?: { color: { r: number; g: number; b: number } }
        skin?: { color: { r: number; g: number; b: number } }
      }
    }>
  }
}

type DeploymentsResponse = {
  deployments: DeploymentEntity[]
}

type AvatarInstance = {
  entity: Entity
  wearables: string[]
  bodyShape: string
  index: number
}

// Data
const wearablesByCollection = wearablesData as Record<string, WearableItem[]>
const emotesByCollection = emotesData as Record<string, EmoteItem[]>

const BASE_WEARABLES = wearablesByCollection['Base Wearables'] || []
const ALL_WEARABLES: WearableItem[] = Object.values(wearablesByCollection).flat()
const ALL_EMOTES: EmoteItem[] = Object.values(emotesByCollection).flat()

// All wearable categories
const ALL_CATEGORIES = [
  'body_shape',
  'skin',
  'hair',
  'eyes',
  'eyebrows',
  'mouth',
  'facial_hair',
  'upper_body',
  'lower_body',
  'feet',
  'hands_wear',
  'hat',
  'helmet',
  'mask',
  'eyewear',
  'earring',
  'tiara',
  'top_head'
]

// Required categories for avatar
const REQUIRED_CATEGORIES = ['eyes', 'eyebrows', 'mouth']
const OPTIONAL_CATEGORIES = ['hair', 'facial_hair', 'upper_body', 'lower_body', 'feet', 'hat', 'helmet', 'mask', 'eyewear', 'earring', 'tiara', 'top_head', 'hands_wear']

// State
const avatars: AvatarInstance[] = []
let selectedIndex = -1
let selectionCube: Entity | null = null
let emoteAvatarCount = 3
let useBaseWearablesOnly = true

// Pre-made profiles state
const fetchedProfiles: ProfileAvatar[] = []
let profilesLoading = false
let profilesError = ''

// Wearable source: 'base' | 'all' | 'profiles'
let wearableSource: 'base' | 'all' | 'profiles' = 'base'

// UI State
let uiCollapsed = false
let currentTab: 'spawn' | 'select' | 'emotes' = 'spawn'
let currentPage = 0
let wearablePage = 0
let selectedCategory = 'all'
const ITEMS_PER_PAGE = 6
const WEARABLES_PER_PAGE = 5

// UI reactivity
let uiVersion = 0
function forceUiUpdate(): void {
  uiVersion++
}

// Get wearables filtered by category
function getFilteredWearables(): WearableItem[] {
  const source = wearableSource === 'base' ? BASE_WEARABLES : ALL_WEARABLES
  if (selectedCategory === 'all') return source
  return source.filter((w) => w.category === selectedCategory)
}

// Generate random wearables for avatar (one per category)
function generateRandomWearables(): string[] {
  const wearables: string[] = []
  const source = wearableSource === 'base' ? BASE_WEARABLES : ALL_WEARABLES
  const usedCategories = new Set<string>()

  // Required categories
  for (const cat of REQUIRED_CATEGORIES) {
    const items = source.filter((w) => w.category === cat)
    if (items.length > 0) {
      wearables.push(items[Math.floor(Math.random() * items.length)].id)
      usedCategories.add(cat)
    }
  }

  // Random optional categories (pick 3-5)
  const shuffled = [...OPTIONAL_CATEGORIES].sort(() => Math.random() - 0.5)
  const numOptional = 3 + Math.floor(Math.random() * 3)

  for (let i = 0; i < numOptional && i < shuffled.length; i++) {
    const cat = shuffled[i]
    if (usedCategories.has(cat)) continue
    const items = source.filter((w) => w.category === cat)
    if (items.length > 0) {
      wearables.push(items[Math.floor(Math.random() * items.length)].id)
      usedCategories.add(cat)
    }
  }

  return wearables
}

// Generate random colors
function randomColor3(): { r: number; g: number; b: number } {
  return {
    r: 0.3 + Math.random() * 0.7,
    g: 0.3 + Math.random() * 0.7,
    b: 0.3 + Math.random() * 0.7
  }
}

// Spawn single avatar with random wearables
function spawnAvatar(position: Vector3): AvatarInstance {
  const entity = sceneEntities.addEntity()
  const index = avatars.length
  const bodyShape =
    Math.random() > 0.5
      ? 'urn:decentraland:off-chain:base-avatars:BaseMale'
      : 'urn:decentraland:off-chain:base-avatars:BaseFemale'

  const wearables = generateRandomWearables()

  Transform.create(entity, {
    position,
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })

  AvatarShape.create(entity, {
    id: `avatar-${index}`,
    name: `Avatar ${index}`,
    bodyShape,
    wearables,
    emotes: [],
    skinColor: randomColor3(),
    hairColor: randomColor3(),
    eyeColor: randomColor3()
  })

  const instance: AvatarInstance = {
    entity,
    wearables,
    bodyShape,
    index
  }

  avatars.push(instance)
  return instance
}

// Spawn single avatar from a profile
function spawnAvatarFromProfile(position: Vector3, profile: ProfileAvatar): AvatarInstance {
  const entity = sceneEntities.addEntity()
  const index = avatars.length

  Transform.create(entity, {
    position,
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })

  AvatarShape.create(entity, {
    id: `avatar-${index}`,
    name: profile.name,
    bodyShape: profile.bodyShape,
    wearables: profile.wearables,
    emotes: profile.emotes.map((e) => e.urn),
    skinColor: profile.skinColor,
    hairColor: profile.hairColor,
    eyeColor: profile.eyeColor
  })

  const instance: AvatarInstance = {
    entity,
    wearables: [...profile.wearables],
    bodyShape: profile.bodyShape,
    index
  }

  avatars.push(instance)
  return instance
}

// Spawn batch of avatars
function spawnBatch(count: number): void {
  // Check if using profiles and none available
  if (wearableSource === 'profiles' && fetchedProfiles.length === 0) {
    console.log('No profiles available. Fetch profiles first or change source.')
    return
  }

  const gridSize = Math.ceil(Math.sqrt(avatars.length + count))
  const spacing = 2.5
  const startX = 24 - (gridSize * spacing) / 2
  const startZ = 24 - (gridSize * spacing) / 2

  for (let i = 0; i < count; i++) {
    const totalIndex = avatars.length
    const row = Math.floor(totalIndex / gridSize)
    const col = totalIndex % gridSize
    const x = startX + col * spacing
    const z = startZ + row * spacing
    const position = Vector3.create(x, 0, z)

    if (wearableSource === 'profiles') {
      // Pick random profile
      const randomProfile = fetchedProfiles[Math.floor(Math.random() * fetchedProfiles.length)]
      spawnAvatarFromProfile(position, randomProfile)
    } else {
      spawnAvatar(position)
    }
  }

  forceUiUpdate()
  console.log(`Spawned ${count} avatars. Total: ${avatars.length}`)
}

// Clear all avatars
function clearAllAvatars(): void {
  for (const avatar of avatars) {
    engine.removeEntity(avatar.entity)
  }
  avatars.length = 0
  selectedIndex = -1
  updateSelectionCube()
  forceUiUpdate()
}

// Select avatar by index
function selectAvatar(index: number): void {
  if (index >= 0 && index < avatars.length) {
    selectedIndex = index
    updateSelectionCube()
    forceUiUpdate()
  }
}

// Update selection cube
function updateSelectionCube(): void {
  if (selectedIndex < 0 || selectedIndex >= avatars.length) {
    if (selectionCube) {
      engine.removeEntity(selectionCube)
      selectionCube = null
    }
    return
  }

  const avatar = avatars[selectedIndex]
  const avatarTransform = Transform.get(avatar.entity)

  if (!selectionCube) {
    selectionCube = sceneEntities.addEntity()
    MeshRenderer.setBox(selectionCube)
    Material.setPbrMaterial(selectionCube, {
      albedoColor: Color4.create(1, 1, 0, 0.5),
      emissiveColor: Color4.Yellow(),
      emissiveIntensity: 2
    })
  }

  Transform.createOrReplace(selectionCube, {
    position: Vector3.create(avatarTransform.position.x, 2.5, avatarTransform.position.z),
    scale: Vector3.create(1.2, 0.3, 1.2)
  })
}

// Get category of wearable from avatar
function getWearableCategory(wearableId: string): string | null {
  const wearable = ALL_WEARABLES.find((w) => w.id === wearableId)
  return wearable?.category || null
}

// Add wearable to selected avatar (replaces same category)
function addWearable(wearableId: string): void {
  if (selectedIndex < 0) return

  const avatar = avatars[selectedIndex]
  const newCategory = getWearableCategory(wearableId)

  if (newCategory) {
    // Remove existing wearable of same category
    avatar.wearables = avatar.wearables.filter((w) => {
      const cat = getWearableCategory(w)
      return cat !== newCategory
    })
  }

  // Add new wearable
  if (!avatar.wearables.includes(wearableId)) {
    avatar.wearables.push(wearableId)
    updateAvatarWearables(avatar)
    forceUiUpdate()
  }
}

// Remove wearable from selected avatar
function removeWearable(wearableId: string): void {
  if (selectedIndex < 0) return

  const avatar = avatars[selectedIndex]
  const idx = avatar.wearables.indexOf(wearableId)
  if (idx !== -1) {
    avatar.wearables.splice(idx, 1)
    updateAvatarWearables(avatar)
    forceUiUpdate()
  }
}

// Update avatar's wearables
function updateAvatarWearables(avatar: AvatarInstance): void {
  const mutableShape = AvatarShape.getMutable(avatar.entity)
  mutableShape.wearables = [...avatar.wearables]
}

// Trigger random emotes
function triggerRandomEmotes(): void {
  if (avatars.length === 0 || ALL_EMOTES.length === 0) return

  const count = Math.min(emoteAvatarCount, avatars.length)
  const indices = [...Array(avatars.length).keys()].sort(() => Math.random() - 0.5).slice(0, count)

  for (const idx of indices) {
    const avatar = avatars[idx]
    const emote = ALL_EMOTES[Math.floor(Math.random() * ALL_EMOTES.length)]

    const mutableShape = AvatarShape.getMutable(avatar.entity)
    mutableShape.expressionTriggerId = emote.id
    mutableShape.expressionTriggerTimestamp = Date.now()
  }
}

// Fetch pre-made profiles from Decentraland deployments API
async function fetchProfiles(): Promise<void> {
  profilesLoading = true
  profilesError = ''
  forceUiUpdate()

  try {
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const url = `https://peer.decentraland.org/content/deployments?entityType=profile&from=${thirtyDaysAgo}&to=${now}&limit=200`

    console.log('Fetching profiles from:', url)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data: DeploymentsResponse = await response.json()
    console.log(`Fetched ${data.deployments.length} profile deployments`)

    // Extract profile data from deployments
    fetchedProfiles.length = 0
    for (const deployment of data.deployments) {
      if (deployment.metadata?.avatars?.[0]?.avatar) {
        const av = deployment.metadata.avatars[0]
        const avatar = av.avatar
        fetchedProfiles.push({
          name: av.name || 'Unknown',
          bodyShape: avatar.bodyShape || 'urn:decentraland:off-chain:base-avatars:BaseMale',
          wearables: avatar.wearables || [],
          emotes: avatar.emotes || [],
          skinColor: avatar.skin?.color || { r: 0.8, g: 0.6, b: 0.5 },
          hairColor: avatar.hair?.color || { r: 0.3, g: 0.2, b: 0.1 },
          eyeColor: avatar.eyes?.color || { r: 0.3, g: 0.5, b: 0.7 }
        })
      }
    }

    console.log(`Parsed ${fetchedProfiles.length} valid profiles`)
    profilesLoading = false
    forceUiUpdate()
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    profilesError = error instanceof Error ? error.message : 'Unknown error'
    profilesLoading = false
    forceUiUpdate()
  }
}

// Pagination helpers
function getPaginatedAvatars(): AvatarInstance[] {
  const start = currentPage * ITEMS_PER_PAGE
  return avatars.slice(start, start + ITEMS_PER_PAGE)
}

function getPaginatedWearables(): WearableItem[] {
  const filtered = getFilteredWearables()
  const start = wearablePage * WEARABLES_PER_PAGE
  return filtered.slice(start, start + WEARABLES_PER_PAGE)
}

function getTotalWearablePages(): number {
  return Math.ceil(getFilteredWearables().length / WEARABLES_PER_PAGE)
}

function getTotalAvatarPages(): number {
  return Math.ceil(avatars.length / ITEMS_PER_PAGE)
}

// Get categories that have wearables in current source
function getAvailableCategories(): string[] {
  const source = wearableSource === 'base' ? BASE_WEARABLES : ALL_WEARABLES
  const cats = new Set(source.map((w) => w.category))
  return ['all', ...ALL_CATEGORIES.filter((c) => cats.has(c))]
}

export function main(): void {
  console.log(`Avatar Stress Test loaded`)
  console.log(`Base wearables: ${BASE_WEARABLES.length}`)
  console.log(`All wearables: ${ALL_WEARABLES.length}`)
  console.log(`All emotes: ${ALL_EMOTES.length}`)

  // Fetch pre-made profiles from Decentraland
  fetchProfiles()

  spawnBatch(4)
}

// Colors
const BG_COLOR = Color4.create(0.05, 0.05, 0.1, 0.95)
const TAB_ACTIVE = Color4.create(0.2, 0.4, 0.6, 1)
const TAB_INACTIVE = Color4.create(0.15, 0.15, 0.2, 1)
const BTN_GREEN = Color4.create(0.2, 0.5, 0.2, 1)
const BTN_RED = Color4.create(0.5, 0.2, 0.2, 1)
const BTN_ORANGE = Color4.create(0.5, 0.3, 0.1, 1)
const BTN_GRAY = Color4.create(0.3, 0.3, 0.3, 1)
const BTN_DARK = Color4.create(0.2, 0.2, 0.2, 1)

export function UI(): JSX.Element {
  const _ = uiVersion

  const selectedAvatar = selectedIndex >= 0 ? avatars[selectedIndex] : null

  // Collapsed view
  if (uiCollapsed) {
    return (
      <UiEntity
        uiTransform={{
          position: { bottom: 10, right: 10 },
          positionType: 'absolute'
        }}
      >
        <Button
          value="AVATAR TEST"
          fontSize={18}
          uiTransform={{ width: 150, height: 50 }}
          uiBackground={{ color: TAB_ACTIVE }}
          onMouseDown={() => {
            uiCollapsed = false
            forceUiUpdate()
          }}
        />
      </UiEntity>
    )
  }

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: { bottom: 10 }
      }}
    >
      <UiEntity
        uiBackground={{ color: BG_COLOR }}
        uiTransform={{
          width: 420,
          flexDirection: 'column',
          padding: 12
        }}
      >
        {/* Header with collapse */}
        <UiEntity uiTransform={{ flexDirection: 'row', height: 40, margin: { bottom: 8 } }}>
          <Label
            value={`AVATAR STRESS TEST (${avatars.length})`}
            fontSize={20}
            color={Color4.Yellow()}
            uiTransform={{ width: '80%' }}
          />
          <Button
            value="X"
            fontSize={20}
            uiTransform={{ width: '20%', height: 35 }}
            uiBackground={{ color: BTN_DARK }}
            onMouseDown={() => {
              uiCollapsed = true
              forceUiUpdate()
            }}
          />
        </UiEntity>

        {/* Tabs */}
        <UiEntity uiTransform={{ flexDirection: 'row', height: 45, margin: { bottom: 10 } }}>
          <Button
            value="SPAWN"
            fontSize={16}
            uiTransform={{ width: '33%', height: 40 }}
            uiBackground={{ color: currentTab === 'spawn' ? TAB_ACTIVE : TAB_INACTIVE }}
            onMouseDown={() => {
              currentTab = 'spawn'
              forceUiUpdate()
            }}
          />
          <Button
            value="SELECT"
            fontSize={16}
            uiTransform={{ width: '34%', height: 40 }}
            uiBackground={{ color: currentTab === 'select' ? TAB_ACTIVE : TAB_INACTIVE }}
            onMouseDown={() => {
              currentTab = 'select'
              forceUiUpdate()
            }}
          />
          <Button
            value="EMOTES"
            fontSize={16}
            uiTransform={{ width: '33%', height: 40 }}
            uiBackground={{ color: currentTab === 'emotes' ? TAB_ACTIVE : TAB_INACTIVE }}
            onMouseDown={() => {
              currentTab = 'emotes'
              forceUiUpdate()
            }}
          />
        </UiEntity>

        {/* SPAWN TAB */}
        {currentTab === 'spawn' && (
          <UiEntity uiTransform={{ flexDirection: 'column' }}>
            <Label value="SPAWN AVATARS" fontSize={16} color={Color4.Green()} uiTransform={{ height: 25 }} />

            <UiEntity uiTransform={{ flexDirection: 'row', height: 55, margin: { top: 5 } }}>
              <Button value="+1" fontSize={22} uiTransform={{ width: '20%', height: 50, margin: 2 }} uiBackground={{ color: BTN_GREEN }} onMouseDown={() => spawnBatch(1)} />
              <Button value="+5" fontSize={22} uiTransform={{ width: '20%', height: 50, margin: 2 }} uiBackground={{ color: BTN_GREEN }} onMouseDown={() => spawnBatch(5)} />
              <Button value="+10" fontSize={22} uiTransform={{ width: '20%', height: 50, margin: 2 }} uiBackground={{ color: BTN_GREEN }} onMouseDown={() => spawnBatch(10)} />
              <Button value="+25" fontSize={22} uiTransform={{ width: '20%', height: 50, margin: 2 }} uiBackground={{ color: BTN_GREEN }} onMouseDown={() => spawnBatch(25)} />
              <Button value="CLR" fontSize={18} uiTransform={{ width: '20%', height: 50, margin: 2 }} uiBackground={{ color: BTN_RED }} onMouseDown={clearAllAvatars} />
            </UiEntity>

            <Label value="WEARABLE SOURCE" fontSize={14} color={Color4.Gray()} uiTransform={{ height: 22, margin: { top: 12 } }} />
            <UiEntity uiTransform={{ flexDirection: 'row', height: 45, margin: { top: 3 } }}>
              <Button
                value="BASE"
                fontSize={14}
                uiTransform={{ width: '33%', height: 40, margin: 2 }}
                uiBackground={{ color: wearableSource === 'base' ? TAB_ACTIVE : BTN_DARK }}
                onMouseDown={() => {
                  wearableSource = 'base'
                  wearablePage = 0
                  forceUiUpdate()
                }}
              />
              <Button
                value="ALL"
                fontSize={14}
                uiTransform={{ width: '33%', height: 40, margin: 2 }}
                uiBackground={{ color: wearableSource === 'all' ? TAB_ACTIVE : BTN_DARK }}
                onMouseDown={() => {
                  wearableSource = 'all'
                  wearablePage = 0
                  forceUiUpdate()
                }}
              />
              <Button
                value={profilesLoading ? 'LOADING...' : `PROFILES (${fetchedProfiles.length})`}
                fontSize={11}
                uiTransform={{ width: '34%', height: 40, margin: 2 }}
                uiBackground={{ color: wearableSource === 'profiles' ? TAB_ACTIVE : BTN_DARK }}
                onMouseDown={() => {
                  wearableSource = 'profiles'
                  wearablePage = 0
                  forceUiUpdate()
                }}
              />
            </UiEntity>

            {profilesError && (
              <Label value={`Error: ${profilesError.substring(0, 30)}`} fontSize={11} color={Color4.Red()} uiTransform={{ height: 18 }} />
            )}

            <Label value={`Total: ${avatars.length} avatars`} fontSize={14} color={Color4.Gray()} uiTransform={{ height: 25, margin: { top: 8 } }} />
          </UiEntity>
        )}

        {/* SELECT TAB */}
        {currentTab === 'select' && (
          <UiEntity uiTransform={{ flexDirection: 'column' }}>
            {/* Avatar selection */}
            <Label value={`SELECT AVATAR (${selectedIndex >= 0 ? selectedIndex : 'None'})`} fontSize={16} color={Color4.create(0, 1, 1, 1)} uiTransform={{ height: 25 }} />

            {avatars.length === 0 ? (
              <Label value="No avatars. Go to SPAWN tab." fontSize={14} color={Color4.Gray()} uiTransform={{ height: 40, margin: { top: 10 } }} />
            ) : (
              <UiEntity uiTransform={{ flexDirection: 'column' }}>
                <UiEntity uiTransform={{ flexDirection: 'row', flexWrap: 'wrap', margin: { top: 5 } }}>
                  {getPaginatedAvatars().map((avatar) => (
                    <Button
                      key={avatar.index}
                      value={`${avatar.index}`}
                      fontSize={20}
                      uiTransform={{ width: 55, height: 50, margin: 3 }}
                      uiBackground={{ color: avatar.index === selectedIndex ? Color4.Yellow() : BTN_GRAY }}
                      color={avatar.index === selectedIndex ? Color4.Black() : Color4.White()}
                      onMouseDown={() => selectAvatar(avatar.index)}
                    />
                  ))}
                </UiEntity>

                {/* Avatar pagination */}
                {getTotalAvatarPages() > 1 && (
                  <UiEntity uiTransform={{ flexDirection: 'row', height: 40, justifyContent: 'center', margin: { top: 5 } }}>
                    <Button value="<" fontSize={22} uiTransform={{ width: 50, height: 35 }} uiBackground={{ color: currentPage > 0 ? BTN_GRAY : BTN_DARK }} onMouseDown={() => { if (currentPage > 0) { currentPage--; forceUiUpdate() } }} />
                    <Label value={`${currentPage + 1}/${getTotalAvatarPages()}`} fontSize={16} uiTransform={{ width: 70 }} textAlign="middle-center" />
                    <Button value=">" fontSize={22} uiTransform={{ width: 50, height: 35 }} uiBackground={{ color: currentPage < getTotalAvatarPages() - 1 ? BTN_GRAY : BTN_DARK }} onMouseDown={() => { if (currentPage < getTotalAvatarPages() - 1) { currentPage++; forceUiUpdate() } }} />
                  </UiEntity>
                )}
              </UiEntity>
            )}

            {/* Wearables for selected avatar */}
            {selectedAvatar && (
              <UiEntity uiTransform={{ flexDirection: 'column', margin: { top: 10 } }}>
                <Label value={`WEARABLES (${selectedAvatar.wearables.length})`} fontSize={16} color={Color4.Magenta()} uiTransform={{ height: 25 }} />

                {/* Current wearables list */}
                <UiEntity uiTransform={{ flexDirection: 'column', margin: { top: 5 }, maxHeight: 120 }}>
                  {selectedAvatar.wearables.slice(0, 3).map((w, i) => {
                    const wearable = ALL_WEARABLES.find((x) => x.id === w)
                    const cat = wearable?.category || '?'
                    const name = wearable?.name || w.split(':').pop() || ''
                    return (
                      <UiEntity key={i} uiTransform={{ flexDirection: 'row', height: 32, margin: 1 }}>
                        <Label value={`[${cat.substring(0, 6)}]`} fontSize={12} color={Color4.Gray()} uiTransform={{ width: '25%' }} />
                        <Label value={name.substring(0, 15)} fontSize={13} uiTransform={{ width: '50%' }} />
                        <Button value="X" fontSize={14} uiTransform={{ width: '25%', height: 28 }} uiBackground={{ color: BTN_RED }} onMouseDown={() => removeWearable(w)} />
                      </UiEntity>
                    )
                  })}
                  {selectedAvatar.wearables.length > 3 && (
                    <Label value={`+${selectedAvatar.wearables.length - 3} more...`} fontSize={12} color={Color4.Gray()} uiTransform={{ height: 20 }} />
                  )}
                </UiEntity>

                {/* Category filter */}
                <Label value="ADD BY CATEGORY" fontSize={14} color={Color4.Gray()} uiTransform={{ height: 22, margin: { top: 8 } }} />
                <UiEntity uiTransform={{ flexDirection: 'row', flexWrap: 'wrap', margin: { top: 3 } }}>
                  {getAvailableCategories().slice(0, 8).map((cat) => (
                    <Button
                      key={cat}
                      value={cat === 'all' ? 'ALL' : cat.substring(0, 5).toUpperCase()}
                      fontSize={11}
                      uiTransform={{ width: 48, height: 30, margin: 1 }}
                      uiBackground={{ color: selectedCategory === cat ? TAB_ACTIVE : BTN_DARK }}
                      onMouseDown={() => {
                        selectedCategory = cat
                        wearablePage = 0
                        forceUiUpdate()
                      }}
                    />
                  ))}
                </UiEntity>

                {/* Wearable list to add */}
                <UiEntity uiTransform={{ flexDirection: 'column', margin: { top: 5 } }}>
                  {getPaginatedWearables().map((w, i) => (
                    <Button
                      key={i}
                      value={`+ ${w.name.substring(0, 20)}`}
                      fontSize={13}
                      uiTransform={{ height: 32, margin: 1 }}
                      uiBackground={{ color: BTN_GREEN }}
                      onMouseDown={() => addWearable(w.id)}
                    />
                  ))}
                </UiEntity>

                {/* Wearable pagination */}
                {getTotalWearablePages() > 1 && (
                  <UiEntity uiTransform={{ flexDirection: 'row', height: 35, justifyContent: 'center', margin: { top: 5 } }}>
                    <Button value="<" fontSize={20} uiTransform={{ width: 45, height: 30 }} uiBackground={{ color: wearablePage > 0 ? BTN_GRAY : BTN_DARK }} onMouseDown={() => { if (wearablePage > 0) { wearablePage--; forceUiUpdate() } }} />
                    <Label value={`${wearablePage + 1}/${getTotalWearablePages()}`} fontSize={14} uiTransform={{ width: 60 }} textAlign="middle-center" />
                    <Button value=">" fontSize={20} uiTransform={{ width: 45, height: 30 }} uiBackground={{ color: wearablePage < getTotalWearablePages() - 1 ? BTN_GRAY : BTN_DARK }} onMouseDown={() => { if (wearablePage < getTotalWearablePages() - 1) { wearablePage++; forceUiUpdate() } }} />
                  </UiEntity>
                )}
              </UiEntity>
            )}
          </UiEntity>
        )}

        {/* EMOTES TAB */}
        {currentTab === 'emotes' && (
          <UiEntity uiTransform={{ flexDirection: 'column' }}>
            <Label value="RANDOM EMOTES" fontSize={16} color={Color4.create(1, 0.5, 0, 1)} uiTransform={{ height: 25 }} />

            <Label value="Number of avatars to emote:" fontSize={14} color={Color4.Gray()} uiTransform={{ height: 22, margin: { top: 10 } }} />

            <UiEntity uiTransform={{ flexDirection: 'row', height: 55, margin: { top: 5 } }}>
              <Button
                value="-"
                fontSize={28}
                uiTransform={{ width: '20%', height: 50 }}
                uiBackground={{ color: BTN_GRAY }}
                onMouseDown={() => {
                  if (emoteAvatarCount > 1) {
                    emoteAvatarCount--
                    forceUiUpdate()
                  }
                }}
              />
              <Label value={`${emoteAvatarCount}`} fontSize={28} uiTransform={{ width: '30%', height: 50 }} textAlign="middle-center" />
              <Button
                value="+"
                fontSize={28}
                uiTransform={{ width: '20%', height: 50 }}
                uiBackground={{ color: BTN_GRAY }}
                onMouseDown={() => {
                  emoteAvatarCount++
                  forceUiUpdate()
                }}
              />
              <Button
                value="MAX"
                fontSize={16}
                uiTransform={{ width: '30%', height: 50 }}
                uiBackground={{ color: BTN_ORANGE }}
                onMouseDown={() => {
                  emoteAvatarCount = Math.max(1, avatars.length)
                  forceUiUpdate()
                }}
              />
            </UiEntity>

            <Button
              value="TRIGGER EMOTES"
              fontSize={20}
              uiTransform={{ height: 55, margin: { top: 15 } }}
              uiBackground={{ color: BTN_ORANGE }}
              onMouseDown={triggerRandomEmotes}
            />

            <Button
              value="EMOTE ALL AVATARS"
              fontSize={18}
              uiTransform={{ height: 50, margin: { top: 10 } }}
              uiBackground={{ color: Color4.create(0.6, 0.4, 0.1, 1) }}
              onMouseDown={() => {
                emoteAvatarCount = avatars.length
                triggerRandomEmotes()
                forceUiUpdate()
              }}
            />

            <Label value={`Available emotes: ${ALL_EMOTES.length}`} fontSize={12} color={Color4.Gray()} uiTransform={{ height: 20, margin: { top: 15 } }} />
            <Label value={`Total avatars: ${avatars.length}`} fontSize={12} color={Color4.Gray()} uiTransform={{ height: 20 }} />
          </UiEntity>
        )}
      </UiEntity>
    </UiEntity>
  )
}
