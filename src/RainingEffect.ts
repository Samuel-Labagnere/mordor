import { Effect } from 'postprocessing'
import { NormalBlending, Uniform, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three'

import rainingFragmentShader from '~/shaders/raining.frag'

export class RainingEffect extends Effect {
  constructor() {
    super(
      'RainingEffect',
      rainingFragmentShader,
      {
        blendFunction: NormalBlending,
        uniforms: new Map(
          [
            ['resolution', new Uniform(new Vector3() as any)],
            ['time', new Uniform(0)]
          ]
        )
      }
    )
  }

  public async update(renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, deltaTime?: number) {
    // @ts-ignore
    this.uniforms.get('time').value += deltaTime;

    const size = renderer.getSize(new Vector2());

    // @ts-ignore
    this.uniforms.get('resolution').value.set(size.x, size.y, 1);
  }
}
