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
  type Texture
} from 'three'

import type {
  Viewport,
  Clock,
  Lifecycle
} from '~/core'

import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import vertexShader from '~/shaders/sauron-eye.vert'
import fragmentShader from '~/shaders/sauron-eye.frag'
import noiseMapSrc from '~~/assets/textures/perlin-noise.png'
import baradDur from '~~/assets/models/castle_of_barad_dur.glb'

export interface BaradDurParamaters {
  clock: Clock
  camera: PerspectiveCamera
  viewport: Viewport
}

export class BaradDur extends Scene implements Lifecycle {
  public clock: Clock
  public camera: PerspectiveCamera
  public viewport: Viewport
  public mesh: Points<IcosahedronGeometry, CustomShaderMaterial>
  public ambiantLight: AmbientLight
  public fireProjectionLight: PointLight
  public loader: GLTFLoader

  public constructor({
    clock,
    camera,
    viewport
  }: BaradDurParamaters) {
    super()

    this.clock = clock
    this.camera = camera
    this.viewport = viewport

    this.mesh = new Points( // Add SelectiveBloomEffect from postprocessing ?
      new IcosahedronGeometry(1.3, 64),
      new CustomShaderMaterial({
        baseMaterial: new PointsMaterial({
          color: 0xffffff,
          size: 1.,
          blending: AdditiveBlending
        }),
        vertexShader,
        fragmentShader,
        uniforms: {
          radius: {
            value: 1
          },
          noiseAmplitude: {
            value: 2.5
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

    this.ambiantLight = new AmbientLight(0xbfbddb, 1.0)
    this.ambiantLight.position.set(10, 10, 10)

    this.fireProjectionLight = new PointLight(0xff0000, 1000.0, 20.0)
    this.fireProjectionLight.position.set(0, 1, 0)

    this.loader = new GLTFLoader()

    this.add(
      this.mesh,
      this.fireProjectionLight,
      this.ambiantLight
    )
  }

  public async load(): Promise<void> {
    const noiseMap = await new Promise<Texture>((resolve, reject) => {
      new TextureLoader().load(noiseMapSrc, resolve, reject)
    })

    noiseMap.wrapS = RepeatWrapping
    noiseMap.wrapT = RepeatWrapping

    this.mesh.material.uniforms.noiseMap.value = noiseMap

    this.loader.load(
      baradDur,
      (gltf) => {
        gltf.scene.scale.set(0.02, 0.02, 0.02)
        gltf.scene.position.set(0, -32, 0)
        this.add(gltf.scene)
      }
    )
  }

  public update(): void {
    this.mesh.material.uniforms.time.value = this.clock.elapsed
  }

  public resize(): void {
    this.camera.aspect = this.viewport.ratio
    this.camera.updateProjectionMatrix()
  }

  public dispose(): void {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}
