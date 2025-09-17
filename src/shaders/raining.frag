uniform vec2 resolution;
uniform float time;
uniform sampler2D tDiffuse;

void mainImage(in vec4 inputColor, in vec2 uv, out vec4 outputColor) {
  float alpha = 0.;
  
  for (float i = 0.; i < 50.; i++) {
    float dropX = fract(sin(i * 12.9898) * 43758.5453);
    float dropY = fract(sin(i * 78.233) * 43758.5453);
    float rainSpeed = -.5 * (.5 + fract(sin(i * 34.789) * 12345.678) * .5);
    float dropSize = .000001 * (.5 + fract(sin(i * 56.789) * 98765.432) * .5);
    vec2 rainDropPos = vec2(dropX, fract(dropY + time * rainSpeed));
    vec2 stretchedUV = vec2(uv.x, uv.y * (.02 + fract(sin(i * 45.678) * 65432.1) * .01));
    alpha += exp(-length(stretchedUV - rainDropPos) * length(stretchedUV - rainDropPos) / dropSize);
  }

  // Sample the rendered scene texture and a slight brightness
  vec4 sceneColor = texture(tDiffuse, uv);
  sceneColor.rgb += alpha * .5;

  outputColor = sceneColor * alpha;
}
