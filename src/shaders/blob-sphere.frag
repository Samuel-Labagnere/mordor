precision highp float;

#define SQRT_2 1.239409559

uniform float time;
uniform float noiseSpeed;

in float vNoise;

// Helper function to convert HSV to RGB (h in [0,1])
vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(
    abs(mod(c.x * 6. + vec3(0.,4.,2.),6.) - 3.) - 1.,
    0.0,
    1.0
  );
  rgb = rgb * rgb * (3. - 2. * rgb); // cubic smoothing
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  float disc = pow(1.0 - length(gl_PointCoord * 2.0 - 1.0) / SQRT_2, 5.);

  // Hue cycles over time, adding vNoise for variation per fragment
  float hue = mod(time * noiseSpeed * 0.1 + vNoise, 1.0);
  
  // Use full saturation and brightness for vivid colors
  vec3 color = hsv2rgb(vec3(hue, 1.0, 1.0));

  csm_DiffuseColor = vec4(color, .1);
}
