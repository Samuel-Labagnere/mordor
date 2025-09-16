import {
  Scene,
  Points,
  IcosahedronGeometry,
  PointsMaterial,
  TextureLoader,
  RepeatWrapping,
  AdditiveBlending,
  PointLight,
  PerspectiveCamera,
  type Texture
} from 'three'

import type {
  Viewport,
  Clock,
  Lifecycle
} from '~/core'

import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import vertexShader from '~/shaders/sauron-eye.vert'
import fragmentShader from '~/shaders/sauron-eye.frag'
import noiseMapSrc from '~~/assets/textures/perlin-noise.png'

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
  public light1: PointLight
  public light2: PointLight
  public light3: PointLight

  public constructor({
    clock,
    camera,
    viewport
  }: BaradDurParamaters) {
    super()

    this.clock = clock
    this.camera = camera
    this.viewport = viewport

    this.mesh = new Points(
      new IcosahedronGeometry(1.3, 64),
      new CustomShaderMaterial({
        baseMaterial: new PointsMaterial({
          color: 0xffffff,
          size: 0.02,
          blending: AdditiveBlending
        }),
        vertexShader,
        fragmentShader,
        uniforms: {
          radius: {
            value: 1
          },
          noiseAmplitude: {
            value: .75
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

    this.light1 = new PointLight(0xffbbff, 0.5, 30, 0.5)
    this.light1.position.set(2, 0, -2)

    this.light2 = new PointLight(0xbbffff, 0.5, 30, 0.5)
    this.light2.position.set(-2, 4, 2)

    this.light3 = new PointLight(0xffffff, 1, 30, 2)
    this.light3.position.set(0, 5, 0)

    this.add(
      this.mesh,
      this.light1,
      this.light2,
      this.light3
    )
  }

  public async load(): Promise<void> {
    const noiseMap = await new Promise<Texture>((resolve, reject) => {
      new TextureLoader().load(noiseMapSrc, resolve, reject)
    })

    noiseMap.wrapS = RepeatWrapping
    noiseMap.wrapT = RepeatWrapping

    this.mesh.material.uniforms.noiseMap.value = noiseMap
  }

  public update(): void {
    const theta = Math.atan2(this.camera.position.x, this.camera.position.z)

    this.light1.position.x = Math.cos(theta + this.clock.elapsed * 0.001) * 2
    this.light1.position.z = Math.sin(theta + this.clock.elapsed * 0.0005) * 2
    this.light2.position.y = Math.sin(theta + this.clock.elapsed * 0.001) * 4
    this.light2.position.z = Math.cos(theta + this.clock.elapsed * 0.0005) * 2

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
