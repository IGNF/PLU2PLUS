

const float m00 = 1.; // X homothetic value in 3x3 matrix
const float m02 = 0.; // X translation value in 3x3 matrix
const float m11 = 1.; // Y homothetic value in 3x3 matrix
const float m12 = 0.; // Y translation value in 3x3 matrix
uniform float screenWidth;
uniform float screenHeight;
uniform vec3 vertexColor;


varying vec4 vColor;
varying	vec2 textureUV;

void main(void) {
    vec3 vertexPosition = position;
    vec2 vertexTextureCoord = vec2 (0.4, 0.4) * uv;
	//gl_Position = projectionMatrix * modelViewMatrix * vec4( -1.0 + 2.0 * (vertexPosition.x * m00 + m02) / (screenWidth + 1.0), 1.0 - 2.0 * ( vertexPosition.y * m11 + m12 ) / ( screenHeight + 1.0 ), 0.0, 1.0);
	gl_Position = projectionMatrix * modelViewMatrix * vec4( vertexPosition, 1.0 );
	vColor = vec4(vertexColor,1.0);
	textureUV = vertexTextureCoord;
}

