import {
  engine,
  Entity,
  Material,
  MeshRenderer,
  Transform,
  TextureUnion
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'

// Atlas config
const ATLAS_SRC = 'assets/atlas/atlas_1024.png'
const ATLAS_ALPHA_SRC = 'assets/atlas/atlas_1024_alpha.png'
const ATLAS_SIZE = { width: 1024, height: 1024 }

// Button images from atlas
const IMAGES = {
  showTryOn: { x: 605, y: 179, width: 382, height: 90 },
  reset: { x: 515, y: 302, width: 218, height: 90 },
  exit: { x: 183, y: 394, width: 180, height: 92 },
  tryBtn: { x: 495, y: 394, width: 201, height: 80 }
}

function posToUVSDoubleSide(
  rangeX: [number, number],
  rangeY: [number, number]
): number[] {
  const w = ATLAS_SIZE.width
  const h = ATLAS_SIZE.height
  return [
    rangeX[0] / w, (h - rangeY[1]) / h,
    rangeX[0] / w, (h - rangeY[0]) / h,
    rangeX[1] / w, (h - rangeY[0]) / h,
    rangeX[1] / w, (h - rangeY[1]) / h,
    // back
    rangeX[1] / w, (h - rangeY[1]) / h,
    rangeX[1] / w, (h - rangeY[0]) / h,
    rangeX[0] / w, (h - rangeY[0]) / h,
    rangeX[0] / w, (h - rangeY[1]) / h
  ]
}

function getUVs(img: { x: number; y: number; width: number; height: number }) {
  return posToUVSDoubleSide([img.x, img.x + img.width], [img.y, img.y + img.height])
}

let tex: TextureUnion
let alphaTex: TextureUnion

function getTex() {
  if (!tex) tex = Material.Texture.Common({ src: ATLAS_SRC })
  return tex
}
function getAlphaTex() {
  if (!alphaTex) alphaTex = Material.Texture.Common({ src: ATLAS_ALPHA_SRC })
  return alphaTex
}

export function main(): void {
  console.log('[Test] Creating simple buttons')

  // Button 1: "SHOW YOUR STYLE" - Basic material with SAME texture as alpha (test)
  const btn1 = engine.addEntity()
  Transform.create(btn1, {
    position: Vector3.create(8, 2, 6),
    scale: Vector3.create(3, 0.7, 1),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  MeshRenderer.setPlane(btn1, getUVs(IMAGES.showTryOn))
  Material.setBasicMaterial(btn1, {
    texture: getTex(),
    alphaTexture: getTex(), // Using SAME texture as alpha - test
    diffuseColor: Color4.White()
  })

  // Button 2: "RESET" - Basic material with SAME texture as alpha (test)
  const btn2 = engine.addEntity()
  Transform.create(btn2, {
    position: Vector3.create(6, 2, 6),
    scale: Vector3.create(1.5, 0.6, 1),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  MeshRenderer.setPlane(btn2, getUVs(IMAGES.reset))
  Material.setBasicMaterial(btn2, {
    texture: getTex(),
    alphaTexture: getTex(), // Using SAME texture as alpha - test
    diffuseColor: Color4.White()
  })

  // Button 3: "EXIT" - Basic material with SAME texture as alpha (test)
  const btn3 = engine.addEntity()
  Transform.create(btn3, {
    position: Vector3.create(10, 2, 6),
    scale: Vector3.create(1.2, 0.6, 1),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  MeshRenderer.setPlane(btn3, getUVs(IMAGES.exit))
  Material.setBasicMaterial(btn3, {
    texture: getTex(),
    alphaTexture: getTex(), // Using SAME texture as alpha - test
    diffuseColor: Color4.White()
  })

  // Button 4: "TRY" - Basic material WITHOUT alpha (opaque)
  const btn4 = engine.addEntity()
  Transform.create(btn4, {
    position: Vector3.create(8, 3, 6),
    scale: Vector3.create(1.5, 0.6, 1),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  MeshRenderer.setPlane(btn4, getUVs(IMAGES.tryBtn))
  Material.setBasicMaterial(btn4, {
    texture: getTex(),
    diffuseColor: Color4.White()
  })

  // Button 5: Full atlas texture (no UVs) for reference
  const btn5 = engine.addEntity()
  Transform.create(btn5, {
    position: Vector3.create(8, 4, 6),
    scale: Vector3.create(2, 2, 1),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  MeshRenderer.setPlane(btn5)
  Material.setBasicMaterial(btn5, {
    texture: getTex(),
    diffuseColor: Color4.White()
  })

  // Reference box so we know we're in the right place
  const box = engine.addEntity()
  Transform.create(box, {
    position: Vector3.create(8, 0.5, 8),
    scale: Vector3.create(2, 1, 2)
  })
  MeshRenderer.setBox(box)
  Material.setPbrMaterial(box, {
    albedoColor: Color4.Red()
  })

  console.log('[Test] Created 5 buttons at z=6, red box at z=8')
}
