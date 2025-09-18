import {
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  RepeatWrapping,
  TextureLoader
} from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
import baradDur from '~~/assets/models/castle_of_barad_dur.glb'
import rockDiff from '~~/assets/textures/lichen_rock_diff_1k.jpg'
import rockNor from '~~/assets/textures/lichen_rock_nor_gl_1k.jpg'
import rockArm from '~~/assets/textures/lichen_rock_arm_1k.jpg'
import { Lifecycle } from "~/core"

export class BaradDur extends Object3D implements Lifecycle {
  private gltfLoader: GLTFLoader
  private textureLoader: TextureLoader
  private plane: Mesh<PlaneGeometry, MeshStandardMaterial>

  constructor() {
    super()

    this.gltfLoader = new GLTFLoader()
    this.textureLoader = new TextureLoader()
    this.plane = this.buildPlane()
  }

  private buildPlane(): Mesh<PlaneGeometry, MeshStandardMaterial> {
    const plane = new Mesh(
      new PlaneGeometry(500, 500),
      new MeshStandardMaterial({ color: 0x545353 })
    )
    plane.rotateX(-1.57)
    plane.position.set(0, -29, 0)
    
    this.add(plane)

    return plane
  }

  public async load(): Promise<void> {
    this.gltfLoader.load(
      baradDur,
      (gltf) => {
        gltf.scene.scale.set(0.02, 0.02, 0.02)
        gltf.scene.position.set(0, -31.5, 0)
        this.add(gltf.scene)
      }
    )

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

  public update(): void {}

  public resize(): void {}

  public dispose(): void {
    this.plane.geometry.dispose()
    this.plane.material.dispose()
  }
}
