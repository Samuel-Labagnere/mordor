import {
  Scene,
  AmbientLight,
  PerspectiveCamera,
  DirectionalLight,
  Object3D,
  EquirectangularReflectionMapping
} from 'three'
import type {
  Viewport,
  Clock,
  Lifecycle
} from '~/core'
import skybox from '~~/assets/textures/overcast_soil_puresky_1k.hdr'
import { TheEye } from '~/objects/TheEye'
import { BaradDur } from '~/objects/BaradDur'
import { RGBELoader } from 'three/examples/jsm/Addons.js'
import { playThunderLoop } from '~/utils/thunder-player'

export interface BaradDurSceneParameters {
  clock: Clock
  camera: PerspectiveCamera
  viewport: Viewport
}

export class BaradDurScene extends Scene implements Lifecycle {
  public clock: Clock
  public camera: PerspectiveCamera
  public viewport: Viewport
  public rgbeLoader: RGBELoader
  public eye: TheEye
  public baradDur: BaradDur
  public ambientLight: AmbientLight
  public backLight: DirectionalLight
  public backLightTarget: Object3D

  public constructor({
    clock,
    camera,
    viewport
  }: BaradDurSceneParameters) {
    super()

    this.clock = clock
    this.camera = camera
    this.viewport = viewport
    this.rgbeLoader = new RGBELoader()
    this.eye = new TheEye({ clock: this.clock, camera: this.camera })
    this.baradDur = new BaradDur()
    this.ambientLight = new AmbientLight(0x6e6e6e, 1.)

    this.backLightTarget = new Object3D()
    this.backLightTarget.position.set(0, -10, 5)

    this.backLight = new DirectionalLight(0x2c2b40, 50.)
    this.backLight.position.set(-10, -22, -10)
    this.backLight.target = this.backLightTarget

    playThunderLoop(this)

    this.add(
      this.baradDur,
      this.eye,
      this.ambientLight,
      this.backLightTarget,
      this.backLight
    )
  }

  public async load(): Promise<void> {
    await Promise.all([
      this.eye.load(),
      this.baradDur.load(),
      this.rgbeLoader.load(
        skybox,
        (texture) => {
          texture.mapping = EquirectangularReflectionMapping
          this.background = texture
          this.backgroundIntensity = .1
        }
      )
    ])

    document.addEventListener('keydown', this.ignitionCallback)
    document.addEventListener('mousedown', this.ignitionCallback)
  }

  public update(): void {
    this.eye.update()
    this.baradDur.update()
  }

  public resize(): void {
    this.camera.aspect = this.viewport.ratio
    this.camera.updateProjectionMatrix()

    this.eye.resize()
    this.baradDur.resize()
  }

  public dispose(): void {
    this.eye.dispose()
    this.baradDur.dispose()

    document.removeEventListener('keydown', this.ignitionCallback)
    document.removeEventListener('mousedown', this.ignitionCallback)
  }

  private ignitionCallback = (_event: KeyboardEvent|MouseEvent) => {
    this.eye.show()
    document.removeEventListener('keydown', this.ignitionCallback)
    document.removeEventListener('mousedown', this.ignitionCallback)

    const player: HTMLAudioElement|null = document.querySelector('#musicPlayer')

    if (player) {
      player.play()
      // Skip the slow beginning which leads to confusion weither the audio started or not
      player.currentTime = 15.7
    }

    const dialogs = document.querySelectorAll('.dialog')
    if (dialogs) this.startDialogsLoop(dialogs)
  }

  private startDialogsLoop = (dialogs: NodeListOf<Element>, delayOffset = 0) => {
    let index = 0

    const showNextDialog = () => {
      const dialog = dialogs[index] as HTMLParagraphElement
      dialog.style.setProperty('opacity', '1')
      setTimeout(() => dialog.style.setProperty('opacity', '0'), 3000)
      index++

      setTimeout(() => {
        if (index >= dialogs.length) index = 0
        showNextDialog()
      }, 10000)
    }

    setTimeout(showNextDialog, delayOffset)
  }
}
