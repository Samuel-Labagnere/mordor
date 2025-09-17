import type {
  WebGLRenderer,
  Scene,
  Camera
} from 'three'

import {
  EffectComposer,
  FXAAEffect,
  EffectPass,
  RenderPass
} from 'postprocessing'

import type {
  Clock,
  Viewport,
  Lifecycle
} from '~/core'
import { RainEffect } from './RainEffect'
import { RainingEffect } from './RainingEffect'

export interface ComposerParameters  {
  renderer: WebGLRenderer
  viewport: Viewport
  clock: Clock
  scene?: Scene
  camera?: Camera
}

export class Composer extends EffectComposer implements Lifecycle {
  public clock: Clock
  public viewport: Viewport
  public renderPass: RenderPass
  public effectPass?: EffectPass
  public fxaaEffect?: FXAAEffect
  public rainEffect?: RainEffect
  public rainPass?: EffectPass
  public rainingEffect?: RainingEffect
  public rainingPass?: EffectPass

  public get camera(): Camera | undefined {
    return this.renderPass.mainCamera
  }

  public constructor({
    renderer,
    viewport,
    clock,
    scene,
    camera
  }: ComposerParameters) {
    super(renderer)
    this.clock = clock
    this.viewport = viewport
    this.renderPass = new RenderPass(scene, camera)
  }

  public async load(): Promise<void> {
    this.fxaaEffect = new FXAAEffect()
    this.effectPass = new EffectPass(this.camera, this.fxaaEffect)

    this.rainEffect = new RainEffect()
    this.rainPass = new EffectPass(this.camera, this.rainEffect)

    this.rainingEffect = new RainingEffect()
    this.rainingPass = new EffectPass(this.camera, this.rainingEffect)

    this.addPass(this.renderPass)
    this.addPass(this.effectPass)
    this.addPass(this.rainingPass)
    this.addPass(this.rainPass)
  }

  public update(): void {

  }

  public resize(): void {
    this.getRenderer().setPixelRatio(this.viewport.dpr)
    this.setSize(this.viewport.size.x, this.viewport.size.y, false)
  }

  public render(): void {
    super.render(this.clock.delta / 1000)
  }
}
