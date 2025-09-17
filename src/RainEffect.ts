import { Effect } from 'postprocessing'
import { NormalBlending, Uniform, WebGLRenderer, WebGLRenderTarget } from 'three'

import rainFragmentShader from '~/shaders/rain.frag'

export class RainEffect extends Effect {
  constructor() {
    super(
      'RainEffect',
      rainFragmentShader,
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
    if (!this.uniforms) { return }

    // @ts-ignore
    this.uniforms.get('time').value += deltaTime
  }
}
