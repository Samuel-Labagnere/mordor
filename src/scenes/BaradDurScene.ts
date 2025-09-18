import {
  Scene,
  AmbientLight,
  PerspectiveCamera,
  DirectionalLight,
  Object3D
} from 'three'

import type {
  Viewport,
  Clock,
  Lifecycle
} from '~/core'

import { TheEye } from '~/objects/TheEye'
import { BaradDur } from '~/objects/BaradDur'

export interface BaradDurSceneParameters {
  clock: Clock
  camera: PerspectiveCamera
  viewport: Viewport
}

export class BaradDurScene extends Scene implements Lifecycle {
  public clock: Clock
  public camera: PerspectiveCamera
  public viewport: Viewport
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

    this.eye = new TheEye({ clock: this.clock, camera: this.camera, scene: this })
    this.eye.initialize()

    this.baradDur = new BaradDur({ scene: this })

    this.ambientLight = new AmbientLight(0x6e6e6e, 1.)

    this.backLightTarget = new Object3D()
    this.backLightTarget.position.set(0, -10, 5)

    this.backLight = new DirectionalLight(0x2c2b40, 50.)
    this.backLight.position.set(-10, -22, -10)
    this.backLight.target = this.backLightTarget

    this.add(
      this.ambientLight,
      this.backLightTarget,
      this.backLight
    )
  }

  public async load(): Promise<void> {
    this.eye.loadNoiseMap()
    this.baradDur.loadBaradDur()

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
