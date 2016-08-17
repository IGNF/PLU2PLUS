varying vec3  vUv;
varying float choixTex;
uniform sampler2D texture1;
uniform sampler2D image;
//uniform sampler2D texture3;
//uniform sampler2D paper;
uniform vec3 color;



void main() {
    //vec2 uv = vUv.xy;
    vec2 uv = vUv.xy/vUv.z;
    vec4 baseColor = texture2D(texture1, (uv+1.)*0.5);
    //vec4 paperColor = texture2D(paper, (uv+1.)*0.5 );

    if (choixTex == 2.0){
        baseColor = texture2D(image, (uv+1.)*0.5);   
    } 
    else if (choixTex == 3.0){
        baseColor = texture2D(image, (uv+1.)*0.5);   
    }

    if ( baseColor.a < 0.3 ) discard;
    gl_FragColor = baseColor+vec4(color,1.0); //0.0 si on veut la transparence des arêtes
}