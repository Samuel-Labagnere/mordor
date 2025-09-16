precision highp float;

#define DOUBLE_PI 6.283185307179586

uniform vec2 aspect;
uniform float time;
uniform float radius;
uniform float noiseAmplitude;
uniform float noiseSpeed;
uniform sampler2D noiseMap;

out float vNoise;

/*
 * Bonus exercise
 *
 * Based on the same technics as exercise #2, animate the vertices of a 3D blob
 * sphere using the vertex shader.
 */
void main() {
  float theta = acos(csm_Position.z / length(csm_Position));
  float phi = atan(csm_Position.x, csm_Position.y);

  vec2 theta_vec2 = vec2(sqrt(theta), time * noiseSpeed);
  vec2 phi_vec2 = vec2(phi + DOUBLE_PI, time * noiseSpeed);

  vec4 noise = texture(noiseMap, vec2(theta_vec2.r + phi_vec2.g, theta_vec2.g + phi_vec2.r));
  vec3 direction = normalize(csm_Position.xyz);

  float fragNoise0 = texture(noiseMap, vec2(csm_Position.x / 6. + time * noiseSpeed * 2., csm_Position.y / 6. + time * noiseSpeed * 2.)).r;
  float fragNoise1 = texture(noiseMap, vec2(csm_Position.y / 6. + time * noiseSpeed * 2., csm_Position.x / 6. + time * noiseSpeed * 2.)).g;
  float fragNoise = (fragNoise0 + fragNoise1) + 1.;

  vNoise = pow(mod(fragNoise * 10., 1.), 2.);

  csm_Position.xyz = direction * radius;
  csm_Position.xyz += direction * noiseAmplitude * noise.xyz;
}
