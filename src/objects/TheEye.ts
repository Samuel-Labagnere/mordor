import {
  Points,
  Mesh,
  IcosahedronGeometry,
  CapsuleGeometry,
  Group,
  PointsMaterial,
  AdditiveBlending,
  PointLight,
  Object3D,
  TextureLoader,
  RepeatWrapping,
  type PerspectiveCamera
} from "three"
import { Clock, Lifecycle } from "~/core"
import CustomShaderMaterial from "three-custom-shader-material/vanilla"
import vertexShader from '~/shaders/sauron-eye.vert'
import fragmentShader from '~/shaders/sauron-eye.frag'
import noise from '~~/assets/textures/perlin-noise.png'

export type EyeType = {
  clock: Clock,
  camera: PerspectiveCamera
}

export class TheEye extends Object3D implements Lifecycle {
  public clock: Clock
  public camera: PerspectiveCamera
  private textureLoader: TextureLoader
  private eye: Points<IcosahedronGeometry, CustomShaderMaterial>
  private pupil: Mesh<CapsuleGeometry, CustomShaderMaterial>
  private lights: Group

  constructor({ clock, camera }: EyeType) {
    super()

    this.clock = clock
    this.camera = camera
    this.textureLoader = new TextureLoader()

    this.eye = this.buildEye()
    this.pupil = this.buildPupil()
    this.lights = this.generateLights()

    this.eye.attach(this.pupil)

    this.hide()

    this.add(this.eye)
    this.add(this.lights)
  }

  private buildEye(): Points<IcosahedronGeometry, CustomShaderMaterial> {
     const eye = new Points(
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
    eye.position.set(0, 0, 0)

    return eye
  }

  private buildPupil(): Mesh<CapsuleGeometry, CustomShaderMaterial> {
    const pupil = new Mesh(
      new CapsuleGeometry(.05, .2, 1., 8.),
      new CustomShaderMaterial({
        baseMaterial: new PointsMaterial({
          color: 0x000000,
          size: .025
        }),
      })
    )
    pupil.position.set(0, 0, 0.35)

    return pupil
  }

  private generateLights(): Group {
    const group = new Group()

    const light1 = new PointLight(0xff2200, 50.0, 25.0, 2.5)
    light1.position.set(0, -.5, 1.5)
    group.add(light1)

    const light2 = new PointLight(0xff2200, 50.0, 25.0, 2.5)
    light2.position.set(1.5, -.5, 0)
    group.add(light2)

    const light3 = new PointLight(0xff2200, 50.0, 25.0, 2.5)
    light3.position.set(0, -.5, -1.5)
    group.add(light3)

    const light4 = new PointLight(0xff2200, 50.0, 25.0, 2.5)
    light4.position.set(-1.5, -.5, 0)
    group.add(light4)

    return group
  }

  public async load(): Promise<void> {
    this.textureLoader.load(
      noise,
      (texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        this.eye.material.uniforms.noiseMap.value = texture
      }
    )
  }

  public update(): void {
    this.eye.material.uniforms.time.value = this.clock.elapsed
    this.eye.quaternion.rotateTowards(this.camera.quaternion, this.clock.delta * .0033)
  }

  public resize(): void {}

  public dispose(): void {
    this.pupil.geometry.dispose()
    this.pupil.material.dispose()
    this.eye.geometry.dispose()
    this.eye.material.dispose()
    this.lights.clear()
  }

  public show(): void {
    this.eye.visible = true
    this.lights.visible = true
  }

  public hide(): void {
    this.eye.visible = false
    this.lights.visible = false
  }
}
