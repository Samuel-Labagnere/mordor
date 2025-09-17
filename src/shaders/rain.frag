precision highp float;

#define RANDOM_MULTIPLIER 345.456
#define RANDOM_VEC_2 vec2(RANDOM_MULTIPLIER / 2., 43.34)

uniform float time;
uniform float seed;
uniform sampler2D tDiffuse;

// Randomizer helpers
// source: https://thebookofshaders.com/10/
float random(float inputValue, float seed) {
  return fract(sin(inputValue * RANDOM_MULTIPLIER) * seed);
}

float random(vec2 inputValue, float seed) {
  return fract(sin(dot(inputValue, vec2(RANDOM_VEC_2))) * seed);
}

vec2 rainDrops(vec2 uv, float seed) {
  float cellsResolution = 10.;
  uv *= cellsResolution;

  float rowIndex = floor(uv.y);
  float shiftX = random(rowIndex, seed);
  uv.x += shiftX;

  float shitY = random(.5, seed);
  uv.y += shitY;

  vec2 cellIndex = floor(uv);
  vec2 cellUv = fract(uv);
  vec2 cellCenter = vec2(.5);

  float distanceFromCenter = distance(cellUv, cellCenter);
  float isInsideDrop = 1. - step(.1, distanceFromCenter);
  float isDropShown = step(.8, random(cellIndex, seed * 2.));

  float dropIntensity = 1. - fract(time * .1 + random(cellIndex, seed * 1.5) * 2.) * 2.;
  dropIntensity = sign(dropIntensity) * abs(dropIntensity * dropIntensity * dropIntensity * dropIntensity);
  dropIntensity = clamp(dropIntensity, 0., 1.);

  vec2 vecToCenter = normalize(cellCenter - cellUv);
  vec2 dropValue = vecToCenter * distanceFromCenter * distanceFromCenter * 40.;
  vec2 drop = dropValue * isDropShown * dropIntensity * isInsideDrop;
 
  return drop;
}

vec2 rainDropsWithIndexModifier(vec2 uv, float seed, int index) {
  return rainDrops(uv, (seed / RANDOM_MULTIPLIER) + float(index) * RANDOM_MULTIPLIER);
}

void mainImage(in vec4 inputColor, in vec2 uv, out vec4 outputColor) {
  vec2 drops = vec2(0.);

  drops = rainDropsWithIndexModifier(uv, seed, 1)
    + rainDropsWithIndexModifier(uv, seed, 2)
    + rainDropsWithIndexModifier(uv, seed, 3)
    + rainDropsWithIndexModifier(uv, seed, 4)
    + rainDropsWithIndexModifier(uv, seed, 5);
  uv += drops;

  // Sample the rendered scene texture with displaced UVs
  vec4 sceneColor = texture(tDiffuse, uv);

  // Add a slight brightness to simulate light reflection
  sceneColor.rgb += drops.x * 0.2;

  outputColor = sceneColor;
}
