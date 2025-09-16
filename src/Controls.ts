import {
  Vector2,
  Vector3,
  Vector4,
  Spherical,
  Box3,
  Sphere,
  Quaternion,
  Matrix4,
  Raycaster,
  type PerspectiveCamera,
  type OrthographicCamera
} from 'three'

import CameraControls from 'camera-controls'
import type { Clock, Lifecycle } from '~/core'

// Improve tree-shaking by only importing the necessary THREE subset instead
// of the whole namespace
CameraControls.install({
  THREE: {
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster
  }
})

export interface ControlsParameters {
  camera: PerspectiveCamera | OrthographicCamera
  element: HTMLElement
  clock: Clock
}

export class Controls extends CameraControls implements Lifecycle {
  public clock: Clock
  public element: HTMLElement

  public constructor({
    camera,
    element,
    clock
  }: ControlsParameters) {
    super(camera)

    this.clock = clock
    this.element = element
    this.minDistance = 15
    this.maxDistance = 31
    this.setPosition(-1.2, -29.4, 23.7)
    this.setTarget(0, -10, 0)
  }

  public start(): void {
    this.disconnect()
    this.connect(this.element)
  }

  public stop(): void {
    this.disconnect()
  }

  public update = (): boolean => {
    return super.update(this.clock.delta / 1000)
  }
}
