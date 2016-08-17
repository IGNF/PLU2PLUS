			uniform float time;
			uniform vec2 resolution;
			//uniform float opacity;
			uniform vec3 color;

			varying vec2 vUv;

			void main( void ) {

				vec2 position = vUv;
				//vec2 position = vUv.xy;

				vec3 colorV = color;
				colorV.x += sin( position.x * cos( time / 15.0 ) * 80.0 ) + cos( position.y * cos( time / 15.0 ) * 10.0 );
				colorV.x += sin( position.y * sin( time / 10.0 ) * 40.0 ) + cos( position.x * sin( time / 25.0 ) * 40.0 );
				colorV.x += sin( position.x * sin( time / 5.0 ) * 10.0 ) + sin( position.y * sin( time / 35.0 ) * 80.0 );
				colorV.x *= sin( time / 10.0 ) * 0.5;

				//gl_FragColor = vec4( vec3( colorV.x, colorV.y, colorV.z), opacity );
				gl_FragColor = vec4( vec3( colorV.x, colorV.y, colorV.z), 1.0 );

			}