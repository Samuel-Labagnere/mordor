import { Effect } from 'postprocessing'
import { NormalBlending, Uniform, WebGLRenderer, WebGLRenderTarget } from 'three'

import rainDropsFragmentShader from '~/shaders/rain-drops.frag'

export class RainDropsEffect extends Effect {
  constructor() {
    super(
      'RainEffect',
      rainDropsFragmentShader,
      {
        blendFunction: NormalBlending,
        uniforms: new Map(
          [
            ['time', new Uniform(0)],
            ['seed', new Uniform(12345.6789)]
          ]
        )
      }
    )
  }

  public update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, deltaTime?: number) {
    // @ts-ignore
    this.uniforms.get('time').value += deltaTime
  }
}
