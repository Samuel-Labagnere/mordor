import {
  Scene,
  Points,
  IcosahedronGeometry,
  PointsMaterial,
  TextureLoader,
  RepeatWrapping,
  AdditiveBlending,
  AmbientLight,
  PointLight,
  PerspectiveCamera,
  DirectionalLight,
  Object3D,
  EquirectangularReflectionMapping,
  CapsuleGeometry,
  Mesh,
  Group,
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
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import vertexShader from '~/shaders/sauron-eye.vert'
import fragmentShader from '~/shaders/sauron-eye.frag'
import noiseMapSrc from '~~/assets/textures/perlin-noise.png'
import skybox from '~~/assets/textures/overcast_soil_puresky_1k.hdr'
import baradDur from '~~/assets/models/castle_of_barad_dur.glb'
import rockDiff from '~~/assets/textures/lichen_rock_diff_1k.jpg'
import rockNor from '~~/assets/textures/lichen_rock_nor_gl_1k.jpg'
import rockArm from '~~/assets/textures/lichen_rock_arm_1k.jpg'

export interface BaradDurParameters {
  clock: Clock
  camera: PerspectiveCamera
  viewport: Viewport
}

export class BaradDur extends Scene implements Lifecycle {
  public clock: Clock
  public camera: PerspectiveCamera
  public viewport: Viewport
  public eyeMesh: Points<IcosahedronGeometry, CustomShaderMaterial>
  public pupilMesh: Mesh<CapsuleGeometry, CustomShaderMaterial>
  public plane: Mesh<PlaneGeometry, MeshStandardMaterial>
  public ambientLight: AmbientLight
  public backLight: DirectionalLight
  public backLightTarget: Object3D
  public lights: Group
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

    this.eyeMesh = new Points( // TODO: Add SelectiveBloomEffect from postprocessing ?
      new IcosahedronGeometry(1.3, 64),
      new CustomShaderMaterial({
        baseMaterial: new PointsMaterial({
          color: 0xffffff,
          size: .025,
          blending: AdditiveBlending
        }),
        vertexShader,
        fragmentShader,
        uniforms: {
          radius: {
            value: .025
          },
          noiseAmplitude: {
            value: .5
          },
          noiseSpeed: {
            value: 0.0015
          },
          effectSpeed: {
            value: 0.0075
          },
          time: {
            value: 0
          },
          noiseMap: {
            value: null
          }
        }
      })
    )

    this.pupilMesh = new Mesh(
      new CapsuleGeometry(.05, .2, 1., 8.),
      new CustomShaderMaterial({
        baseMaterial: new PointsMaterial({
          color: 0x000000,
          size: .025
        }),
      })
    )
    this.pupilMesh.position.set(0, 0, .35)

    this.eyeMesh.attach(this.pupilMesh)
    this.eyeMesh.visible = false

    this.ambientLight = new AmbientLight(0x6e6e6e, 1.)

    this.backLightTarget = new Object3D()
    this.backLightTarget.position.set(0, -10, 5)

    this.backLight = new DirectionalLight(0x2c2b40, 50.)
    this.backLight.position.set(-10, -22, -10)
    this.backLight.target = this.backLightTarget

    this.lights = new Group()
    this.lights.visible = false

    const light1 = new PointLight(0xff2200, 50.0, 25.0, 2.5)
    light1.position.set(0, -.5, 1.5)
    this.lights.add(light1)

    const light2 = new PointLight(0xff2200, 50.0, 25.0, 2.5)
    light2.position.set(1.5, -.5, 0)
    this.lights.add(light2)

    const light3 = new PointLight(0xff2200, 50.0, 25.0, 2.5)
    light3.position.set(0, -.5, -1.5)
    this.lights.add(light3)

    const light4 = new PointLight(0xff2200, 50.0, 25.0, 2.5)
    light4.position.set(-1.5, -.5, 0)
    this.lights.add(light4)

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
      this.eyeMesh,
      this.lights,
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

    this.eyeMesh.material.uniforms.noiseMap.value = noiseMap

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
      this.eyeMesh.visible = true
      this.lights.visible = true
      document.removeEventListener('keyup', startCallback)
      document.removeEventListener('mousedown', startCallback)

      const player: HTMLAudioElement|null = document.querySelector('#musicPlayer')
      const dialog: HTMLParagraphElement|null = document.querySelector('#spotted')

      if (player) {
        player.play()
        // Skip the slow beginning which leads to confusion weither the audio started or not
        player.currentTime = 1.75
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
    this.eyeMesh.material.uniforms.time.value = this.clock.elapsed
    this.eyeMesh.quaternion.rotateTowards(this.camera.quaternion, .05)
  }

  public resize(): void {
    this.camera.aspect = this.viewport.ratio
    this.camera.updateProjectionMatrix()
  }

  public dispose(): void {
    this.eyeMesh.geometry.dispose()
    this.eyeMesh.material.dispose()
  }
}
