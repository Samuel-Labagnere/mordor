import { Clock } from "~/core"
import {
  PerspectiveCamera,
  Scene,
  Points,
  Mesh,
  IcosahedronGeometry,
  CapsuleGeometry,
  Group,
  PointsMaterial,
  AdditiveBlending,
  PointLight,
  Object3D,
  type Texture
} from "three"
import CustomShaderMaterial from "three-custom-shader-material/vanilla"
import vertexShader from '~/shaders/sauron-eye.vert'
import fragmentShader from '~/shaders/sauron-eye.frag'

export type EyeType = Points<IcosahedronGeometry, CustomShaderMaterial>

export class TheEye {
  public clock: Clock
  public camera: PerspectiveCamera
  public scene: Scene
  private eyeMesh: EyeType | null = null
  private pupilMesh: Mesh<CapsuleGeometry, CustomShaderMaterial> | null = null
  private lights: Group | null = null

  constructor(clock: Clock, camera: PerspectiveCamera, scene: Scene) {
    this.clock = clock
    this.camera = camera
    this.scene = scene
  }

  private buildEye(): Points<IcosahedronGeometry, CustomShaderMaterial> {
     return new Points(
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
  }

  private buildPupil(): Mesh<CapsuleGeometry, CustomShaderMaterial> {
    return new Mesh(
      new CapsuleGeometry(.05, .2, 1., 8.),
      new CustomShaderMaterial({
        baseMaterial: new PointsMaterial({
          color: 0x000000,
          size: .025
        }),
      })
    )
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

  public initialize(): void {
    this.eyeMesh = this.buildEye()
    this.pupilMesh = this.buildPupil()
    this.lights = this.generateLights()

    this.pupilMesh.position.set(0, 0, 0.35)
    this.eyeMesh.attach(this.pupilMesh)

    this.hide()
    this.addToScene()
  }

  private addToScene(): void {
    this.scene.add(this.eyeMesh as Object3D, this.lights as Object3D)
  }

  public show(): void {
    if (!this.eyeMesh || !this.lights) return

    this.eyeMesh.visible = true
    this.lights.visible = true
  }

  public hide(): void {
    if (!this.eyeMesh || !this.lights) return

    this.eyeMesh.visible = false
    this.lights.visible = false
  }

  public loadNoiseMap(noiseMap: Texture): void {
    if (!this.eyeMesh) return

    this.eyeMesh.material.uniforms.noiseMap.value = noiseMap
  }

  public update(): void {
    if (!this.eyeMesh) return

    this.eyeMesh.material.uniforms.time.value = this.clock.elapsed
    this.eyeMesh.quaternion.rotateTowards(this.camera.quaternion, .05)
  }

  public dispose(): void {
    if (!this.eyeMesh || !this.lights) return

    this.eyeMesh.geometry.dispose()
    this.eyeMesh.material.dispose()
    this.lights.clear()
  }
}
