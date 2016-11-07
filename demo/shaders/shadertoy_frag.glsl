
uniform sampler2D iChannel0;

varying vec2 vUv;

const vec3 LUMA_COEFFICIENT = vec3(0.2126, 0.7152, 0.0722);

float lumaAtCoord(sampler2D source, vec2 coord) {
  vec3 pixel = texture2D(source, coord).rgb;
  float luma = dot(pixel, LUMA_COEFFICIENT);
  return luma;
}

vec4 normalVector(sampler2D image, float resolution, vec2 coord) {
  float lumaU0 = lumaAtCoord(image, coord + vec2(-1.0,  0.0) / resolution);
  float lumaU1 = lumaAtCoord(image, coord + vec2( 1.0,  0.0) / resolution);
  float lumaV0 = lumaAtCoord(image, coord + vec2( 0.0, -1.0) / resolution);
  float lumaV1 = lumaAtCoord(image, coord + vec2( 0.0,  1.0) / resolution);

  vec2 slope = (vec2(lumaU0 - lumaU1, lumaV0 - lumaV1) + 1.0) * 0.5;
  return vec4(slope, 1.0, 1.0);
}

void main() {
	vec2 uv = -1.0 + 2.0 *vUv;
	gl_FragColor = normalVector(iChannel0, 800.0, uv);
}
