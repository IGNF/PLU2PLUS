			varying vec3 vNormal;
            varying vec2 vUv;
            varying float depth;
            varying vec3 vPosition;
            varying float nDotVP;
            varying vec3 pos;

            uniform float repeat;
            uniform vec3 lightPosition;
            uniform float showOutline;

            //#chunk(shadowmap_pars_vertex);

            void main() {

                float w = 1.;
                vec3 posInc = vec3( 0. );
                if( showOutline == 1. ) posInc = w * normal;

                vUv = vec2 (repeat, repeat) * uv;

                vec4 mvPosition = modelViewMatrix * vec4( position + posInc, 1.0 );
                vPosition = mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
                pos = gl_Position.xyz;
				
				vec4 mvLightPosition = modelViewMatrix * vec4(lightPosition,1.0);
                vec3 vlPosition = mvLightPosition.xyz;


                vNormal = normalMatrix * normal;
                depth = ( length( position.xyz ) / 90. );
                depth = .5 + .5 * depth;

                nDotVP = max( 0., dot( vNormal, normalize( vec3( vlPosition - vPosition) ) ) );

                //#chunk(shadowmap_vertex);

            }