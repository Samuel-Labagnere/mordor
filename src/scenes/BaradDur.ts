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
  type Texture
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
import baradDur from '~~/assets/models/castle_of_barad_dur.glb'

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
  public ambientLight: AmbientLight
  public backLight: DirectionalLight
  public backLightTarget: Object3D
  public light1: PointLight
  public light2: PointLight
  public light3: PointLight
  public light4: PointLight
  public gltfLoader: GLTFLoader
  public rgbeLoader: RGBELoader

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
    this.eyeMesh.rotateX(.75) // TODO: Make it follow the camera - later add some intended latency

    this.ambientLight = new AmbientLight(0xbfbddb, 1.)

    this.backLightTarget = new Object3D()
    this.backLightTarget.position.set(0, -10, 5)

    this.backLight = new DirectionalLight(0xbfbddb, 7.5)
    this.backLight.position.set(-10, -22, -10)
    this.backLight.target = this.backLightTarget

    const lightPositions: [number, number, number][] = [
      [0, -.5, 1.5],
      [1.5, -.5, 0],
      [0, -.5, -1.5],
      [-1.5, -.5, 0],
    ]

    const lights: Array<PointLight> = lightPositions.map(pos => {
      const light = new PointLight(0xff2200, 50.0, 25.0, 2.5)
      light.position.set(...pos)
      return light
    })

    ;[this.light1, this.light2, this.light3, this.light4] = lights

    this.gltfLoader = new GLTFLoader()
    this.rgbeLoader = new RGBELoader()

    this.add(
      this.eyeMesh,
      this.light1,
      this.light2,
      this.light3,
      this.light4,
      this.ambientLight,
      this.backLightTarget,
      this.backLight
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
      '../assets/textures/overcast_soil_puresky_1k.hdr',
      (texture) => {
        texture.mapping = EquirectangularReflectionMapping
        this.background = texture
        this.backgroundIntensity = .1
      }
    )
  }

  public update(): void {
    this.eyeMesh.material.uniforms.time.value = this.clock.elapsed
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
