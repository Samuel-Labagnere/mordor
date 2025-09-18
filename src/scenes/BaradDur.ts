import {
  Scene,
  TextureLoader,
  RepeatWrapping,
  AmbientLight,
  PerspectiveCamera,
  DirectionalLight,
  Object3D,
  EquirectangularReflectionMapping,
  Mesh,
  type Texture,
  PlaneGeometry,
  MeshStandardMaterial
} from 'three'

import type {
  Viewport,
  Clock,
  Lifecycle
} from '~/core'

import { GLTFLoader, RGBELoader } from 'three/examples/jsm/Addons.js';
import noiseMapSrc from '~~/assets/textures/perlin-noise.png'
import skybox from '~~/assets/textures/overcast_soil_puresky_1k.hdr'
import baradDur from '~~/assets/models/castle_of_barad_dur.glb'
import rockDiff from '~~/assets/textures/lichen_rock_diff_1k.jpg'
import rockNor from '~~/assets/textures/lichen_rock_nor_gl_1k.jpg'
import rockArm from '~~/assets/textures/lichen_rock_arm_1k.jpg'
import { TheEye } from '~/objects/TheEye';

export interface BaradDurParameters {
  clock: Clock
  camera: PerspectiveCamera
  viewport: Viewport
}

export class BaradDur extends Scene implements Lifecycle {
  public clock: Clock
  public camera: PerspectiveCamera
  public viewport: Viewport
  public eye: TheEye
  public plane: Mesh<PlaneGeometry, MeshStandardMaterial>
  public ambientLight: AmbientLight
  public backLight: DirectionalLight
  public backLightTarget: Object3D
  public gltfLoader: GLTFLoader
  public rgbeLoader: RGBELoader
  public textureLoader: TextureLoader

  public constructor({
    clock,
    camera,
    viewport
  }: BaradDurParameters) {
    super()

    this.clock = clock
    this.camera = camera
    this.viewport = viewport

    this.eye = new TheEye(this.clock, this.camera, this)
    this.eye.initialize()

    this.ambientLight = new AmbientLight(0x6e6e6e, 1.)

    this.backLightTarget = new Object3D()
    this.backLightTarget.position.set(0, -10, 5)

    this.backLight = new DirectionalLight(0x2c2b40, 50.)
    this.backLight.position.set(-10, -22, -10)
    this.backLight.target = this.backLightTarget

    this.plane = new Mesh(
      new PlaneGeometry(500, 500),
      new MeshStandardMaterial({
        color: 0x545353
      })
    )
    this.plane.rotateX(-1.57)
    this.plane.position.set(0, -29, 0)
    
    this.gltfLoader = new GLTFLoader()
    this.rgbeLoader = new RGBELoader()
    this.textureLoader = new TextureLoader()

    this.add(
      this.ambientLight,
      this.backLightTarget,
      this.backLight,
      this.plane
    )
  }

  public async load(): Promise<void> {
    const noiseMap = await new Promise<Texture>((resolve, reject) => {
      new TextureLoader().load(noiseMapSrc, resolve, reject)
    })

    noiseMap.wrapS = RepeatWrapping
    noiseMap.wrapT = RepeatWrapping

    this.eye.loadNoiseMap(noiseMap)

    this.gltfLoader.load(
      baradDur,
      (gltf) => {
        gltf.scene.scale.set(0.02, 0.02, 0.02)
        gltf.scene.position.set(0, -31.5, 0)
        this.add(gltf.scene)
      }
    )

    this.rgbeLoader.load(
      skybox,
      (texture) => {
        texture.mapping = EquirectangularReflectionMapping
        this.background = texture
        this.backgroundIntensity = .1
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

    const startCallback = (_event: KeyboardEvent|MouseEvent) => {
      this.eye.show()
      document.removeEventListener('keyup', startCallback)
      document.removeEventListener('mousedown', startCallback)

      const player: HTMLAudioElement|null = document.querySelector('#musicPlayer')
      const dialog: HTMLParagraphElement|null = document.querySelector('#spotted')

      if (player) {
        player.play()
        // Skip the slow beginning which leads to confusion weither the audio started or not
        player.currentTime = 15.7
      }
      if (dialog) {
        dialog.style.setProperty('opacity', '1')
        setTimeout(() => dialog.style.setProperty('opacity', '0'), 1500)
      }
    }
    document.addEventListener('keyup', startCallback)
    document.addEventListener('mousedown', startCallback)
  }

  public update(): void {
    this.eye.update()
  }

  public resize(): void {
    this.camera.aspect = this.viewport.ratio
    this.camera.updateProjectionMatrix()
  }

  public dispose(): void {
    this.eye.dispose()
  }
}
