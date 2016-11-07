            uniform sampler2D hatch1;
            uniform sampler2D hatch2;
            uniform sampler2D hatch3;
            uniform sampler2D hatch4;
            uniform sampler2D hatch5;
            uniform sampler2D hatch6;
            uniform sampler2D paper;
            uniform vec3 lightPosition;
            uniform float opacity;

            //vec3 color = vec3( 1., 0., 1. );
            vec3 lightColor = vec3( 1. );

            varying vec2 vUv;
            varying vec3 vNormal;
            varying float depth;
            varying vec3 vPosition;
            varying float nDotVP;
            varying vec3 pos;

            uniform float ambient;
            uniform float diffuse;
            uniform float rim;
            uniform float specular;
            uniform float shininess;
            uniform int solidRender;
            uniform vec4 color;

            //#chunk(common);
            //#chunk(lights_pars);
            //#chunk(shadowmap_pars_fragment);

            vec4 shade() {
                
                float diffuseF = nDotVP;
                float specularF = 0.;
                float ambientF = 1.;

                vec3 n = normalize( vNormal );

                vec3 r = -reflect(lightPosition, n);
                r = normalize(r);
                vec3 v = -vPosition.xyz;
                v = normalize(v);
                float nDotHV = max( 0., dot( r, v ) );

                if( nDotVP != 0. ) specularF = pow ( nDotHV, shininess );
                float rimF = max( 0., abs( dot( n, normalize( -vPosition.xyz ) ) ) );

                float shading = ambient * ambientF + diffuse * diffuseF + rim * rimF + specular * specularF;

                if( solidRender == 1 ) return vec4( shading );

                vec4 c;
                float step = 1. / 6.;
                if( shading <= step ){   
                    c = mix( texture2D( hatch6, vUv ), texture2D( hatch5, vUv ), 6. * shading );
                }
                if( shading > step && shading <= 2. * step ){
                    c = mix( texture2D( hatch5, vUv ), texture2D( hatch4, vUv) , 6. * ( shading - step ) );
                }
                if( shading > 2. * step && shading <= 3. * step ){
                    c = mix( texture2D( hatch4, vUv ), texture2D( hatch3, vUv ), 6. * ( shading - 2. * step ) );
                }
                if( shading > 3. * step && shading <= 4. * step ){
                    c = mix( texture2D( hatch3, vUv ), texture2D( hatch2, vUv ), 6. * ( shading - 3. * step ) );
                }
                if( shading > 4. * step && shading <= 5. * step ){
                    c = mix( texture2D( hatch2, vUv ), texture2D( hatch1, vUv ), 6. * ( shading - 4. * step ) );
                }
                if( shading > 5. * step ){
                    c = mix( texture2D( hatch1, vUv ), vec4( 1. ), 6. * ( shading - 5. * step ) );
                }

                vec4 src = mix( mix( color, vec4( 1. ), c.r ), c, .5 );


                return src;
            }

            void main() {

                vec2 nUV = gl_FragCoord.xy ;
                vec4 dst = vec4( texture2D( paper, nUV ).rgb, 1. );
                vec4 src;


                src = ( .5 * color ) + vec4( 1.  ) * shade();

                vec4 c = src * dst;

                gl_FragColor = vec4( c.rgb, opacity );
            }