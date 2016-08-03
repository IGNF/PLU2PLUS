attribute vec3  position2;
uniform   vec2  resolution;
uniform   float thickness;
varying   vec3 v_uv;
varying   float choixTex;
void main() {
    gl_Position = projectionMatrix *
                    modelViewMatrix *
                    vec4(position,1.0);

    vec4 Position2 = projectionMatrix *
                    modelViewMatrix *
                    vec4(position2,1.0);

    vec2 normal = normalize((gl_Position.xy/gl_Position.w - Position2.xy/Position2.w) * resolution); // * 0.5
    normal = uv.x * uv.y * vec2(-normal.y, normal.x);

    if (length((gl_Position.xyz+Position2.xyz)/2.0)>25.0){
        gl_Position.xy += 25.0*(thickness/length((gl_Position.xyz+Position2.xyz)/2.0)) * gl_Position.w * normal * 2.0 / resolution;
        }
    else {
        gl_Position.xy += thickness * gl_Position.w * normal * 2.0 / resolution;
    }

    if (distance(position, position2) < 3.0){
        choixTex = 1.0;
        
    } else if (distance(position, position2) > 10.0){
        choixTex = 3.0;
    //	v_uv = vec3(2.0*(uv.x-0.5),uv.y,1.)*gl_Position.w;
    }else {
        choixTex = 2.0;
    }

    v_uv = vec3(uv,1.)*gl_Position.w;

}