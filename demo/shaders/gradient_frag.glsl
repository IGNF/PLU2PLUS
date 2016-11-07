
const float time = 1.0;
const float globalOpacity = 1.0;
const float objectOpacity = 1.0;
uniform sampler2D gradientTexture;
uniform vec2 uvMinGradientTexture ;
uniform vec2 uvRangeGradientTexture ;
uniform float screenWidth;
uniform float screenHeight;

varying vec4 vColor;
varying vec2 textureUV;


//out vec4 outColor;

struct DataGradient {
	float screenWidth; 		// screen width in pixels 
	float screenHeight;		// screen height in pixels
	vec4 color;
	vec2 textureUV;
	vec2 worldUV;
	vec2 gradient;
	vec2 worldUVMin;
	vec2 worldUVRange;
};





//
vec3 blueGradient( float v ) {
  float w = sin( v / 6.28 );
  vec3 col1 = vec3( 0.8, 0.9, 1.0 );
  vec3 col2 = vec3( 0.6, 0.7, 0.9 );
  return vec3( col1 * (1.0-w) + col2 * w );
}

vec3 greenGradient( float v ) {
  float w = sin( v / 6.28 );
  vec3 col1 = vec3( 0.48, 0.65, 0.65 );
  vec3 col2 = vec3( 0.48, 0.65, 0.65 );
  return vec3( col1 * (1.0-w) + col2 * w );
}

vec4 computeAnimatedWaterColor( float screenWidth, float screenHeight, vec4 vColor, vec2 textureUV, vec2 worldUV, vec2 gradient, vec2 uvMinGradientTexture, vec2 uvRangeGradientTexture  ) {
	float dmax = 2500.0;
	float distance = worldUV.y * uvRangeGradientTexture.y;
	float dd = 1.0 - smoothstep( 0.0, dmax, distance );
	float sec = mod( 5.0*dd - time*2. / 5000.0, 1.0 );
	//return vec4( blueGradient( sec ) * (dd) + (1.0-dd) * vec3(1.0,1.0,1.0) , 1.0 );
	return vec4( greenGradient( sec ) * (dd) + (1.0-dd) * vec3(1.0,1.0,1.0) , 1.0 );
}

/*vec4 computeAnimatedWaterColor( DataGradient fragmentData ) {
	float dmax = 2500.0;
	float distance = fragmentData.worldUV.y * fragmentData.worldUVRange.y;
	float dd = 1.0 - smoothstep( 0.0, dmax, distance );
	float sec = mod( 5.0*dd - time*2. / 5000.0, 1.0 );
	//return vec4( blueGradient( sec ) * (dd) + (1.0-dd) * vec3(1.0,1.0,1.0) , 1.0 );
	return vec4( greenGradient( sec ) * (dd) + (1.0-dd) * vec3(1.0,1.0,1.0) , 1.0 );
}


vec4 computeColor( DataGradient fragmentData ) {
	return computeAnimatedWaterColor( fragmentData );
}*/
vec4 computeColor( float screenWidth, float screenHeight, vec4 vColor, vec2 textureUV, vec2 worldUV, vec2 gradient, vec2 uvMinGradientTexture, vec2 uvRangeGradientTexture ) {
	return computeAnimatedWaterColor( screenWidth, screenHeight, vColor, textureUV, worldUV, gradient, uvMinGradientTexture, uvRangeGradientTexture );
}

void main(void) {
	// get values in the binary gradient image
	// .xy : uv coordinates in the distance field (scaled between 0..1)
	// .zw : gradient of the distance field (scaled between 0..1)
	// to unscale U & V use uvMinGradientTexture + worldUV * uvRangeGradientTexture

	vec4 tcolor = texture2D(gradientTexture, textureUV * vec2(1,-1) );
	vec2 worldUV = tcolor.rg;
	vec2 gradient = tcolor.ba;

	//DataGradient fragmentOut = DataGradient( screenWidth, screenHeight, vColor, textureUV, worldUV, gradient, uvMinGradientTexture, uvRangeGradientTexture );
	// call subshader 
	//vec4 color = computeColor( fragmentOut );
	vec4 color = computeColor( screenWidth, screenHeight, vColor, textureUV, worldUV, gradient, uvMinGradientTexture, uvRangeGradientTexture );
	// return computed color using object & global opacity
	gl_FragColor = vec4( color.rgb, objectOpacity  * color.a);
}