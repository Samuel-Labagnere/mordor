import {
  EquirectangularReflectionMapping,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  TextureLoader,
  type Object3D,
  type Scene
} from "three"
import { GLTFLoader, RGBELoader } from "three/examples/jsm/Addons.js"
import baradDur from '~~/assets/models/castle_of_barad_dur.glb'
import skybox from '~~/assets/textures/overcast_soil_puresky_1k.hdr'
import rockDiff from '~~/assets/textures/lichen_rock_diff_1k.jpg'
import rockNor from '~~/assets/textures/lichen_rock_nor_gl_1k.jpg'
import rockArm from '~~/assets/textures/lichen_rock_arm_1k.jpg'

export type BaradDurType = {
  scene: Scene
}

export class BaradDur {
  public scene: Scene
  private gltfLoader: GLTFLoader
  private textureLoader: TextureLoader
  private rgbeLoader: RGBELoader
  private plane: Mesh<PlaneGeometry, MeshStandardMaterial>

  constructor({ scene }: BaradDurType) {
    this.scene = scene
    this.gltfLoader = new GLTFLoader()
    this.textureLoader = new TextureLoader()
    this.rgbeLoader = new RGBELoader()
    this.plane = new Mesh(
      new PlaneGeometry(500, 500),
      new MeshStandardMaterial({ color: 0x545353 })
    )
  }

  public loadBaradDur(): void {
    this.gltfLoader.load(
      baradDur,
      (gltf) => {
        gltf.scene.scale.set(0.02, 0.02, 0.02)
        gltf.scene.position.set(0, -31.5, 0)
        this.scene.add(gltf.scene)
      }
    )

    this.rgbeLoader.load(
      skybox,
      (texture) => {
        texture.mapping = EquirectangularReflectionMapping
        this.scene.background = texture
        this.scene.backgroundIntensity = .1
      }
    )
  }

  private loadPlaneTextures(): void {
    this.textureLoader.load(rockDiff, (texture) => this.plane.material.map = texture)
    this.textureLoader.load(rockNor, (texture) => this.plane.material.normalMap = texture)
    this.textureLoader.load(rockArm, (texture) => {
      this.plane.material.aoMap = texture
      this.plane.material.roughnessMap = texture
      this.plane.material.metalnessMap = texture
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
    })
  }

  public initialize(): void {
    this.loadPlaneTextures()

    this.addToScene()
  }

  private addToScene(): void {
    this.scene.add(this.plane as Object3D)
  }
}
