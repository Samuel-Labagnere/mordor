precision highp float;

#define SQRT_2 1.239409559

uniform float time;
uniform float effectSpeed;

in float vNoise;

// Helper function to convert HSV to RGB
// source : https://gist.github.com/983/e170a24ae8eba2cd174f
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1., 2. / 3., 1. / 3., 3.);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6. - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0., 1.), c.y);
}

void main() {
  float disc = pow(1. - length(gl_PointCoord * 2. - 1.) / SQRT_2, 5.);

  // Computing colors as HSV to regulate color range more easily
  float baseHue = mod(time * effectSpeed * .1 + vNoise, 1.);

  // Forcing hue to remain in the red/orange range for the fire visuals
  float hue = mix(0., .15, baseHue);

  // Wavering brightness with a slight offset for a flickering fire effect
  float brightness = mix(.25, 1., (sin(time * effectSpeed) * .5) + .5);

  // Converting the HSV color to RGB because csm_DiffuseColor expects the latter
  vec3 color = hsv2rgb(vec3(hue, 1., brightness));
  csm_DiffuseColor = vec4(color, .1);
}
