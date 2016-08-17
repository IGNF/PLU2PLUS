
    if (distance(position, position2) < 3.0){
        choixTex = 1.0;
        
    } else if (distance(position, position2) > 10.0){
        choixTex = 3.0;
    //	vUv = vec3(2.0*(uv.x-0.5),uv.y,1.)*gl_Position.w;
    }else {
        choixTex = 2.0;
    }

    //vUv = vec2(uv)*gl_Position.w;
    vUv = vec3(uv,1.)*gl_Position.w;
