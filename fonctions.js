			//Permet d'isoler les arêtes pour leur appliquer le LineMaterial
			function geo2line( geo ) {

				var geometry = new THREE.Geometry();
				var vertices = geometry.vertices;
				var vvv = geo.getAttribute('position');

				for ( i = 0; i < vvv.length-2; i=i+3 ) {

					vertices.push( new THREE.Vector3( vvv.array[i], vvv.array[i+1],  vvv.array[i+2] ) );

				}

				geometry.computeLineDistances();

				return geometry;

			}
			
			
			//pour appliquer les textures génériques comme les tuiles
			function assignUVs(geometry) {

				geometry.faceVertexUvs[0] = [];

				geometry.faces.forEach(function(face) {

					var components = ['x', 'y', 'z'].sort(function(a, b) {
						return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
					});
					
					geometry.computeBoundingBox();
					var min     = geometry.boundingBox.min;


					var v1 = geometry.vertices[face.a];
					var v2 = geometry.vertices[face.b];
					var v3 = geometry.vertices[face.c];

					geometry.faceVertexUvs[0].push([
						new THREE.Vector2((v1[components[0]] - min[components[0]]) , (v1[components[1]] - min[components[1]])),
						new THREE.Vector2((v2[components[0]] - min[components[0]]) , (v2[components[1]] - min[components[1]])),
						new THREE.Vector2((v3[components[0]] - min[components[0]]) , (v3[components[1]] - min[components[1]]))
						
						//new THREE.Vector2(v1[components[0]], v1[components[1]])
						//new THREE.Vector2(v2[components[0]], v2[components[1]])
						//new THREE.Vector2(v3[components[0]], v3[components[1]])
					]);

				});

				geometry.uvsNeedUpdate = true;
			}
			
			
			//déplace le mesh
			function moveMesh (mesh, x, y, z) {
			
				mesh.position.x = x;
				mesh.position.y = y;
				mesh.position.z = z;
				return mesh;
			}
				
				
			
			
			/*function removeEntity(name) {
				var selectedObject = scene.getObjectByName(name);
				scene.remove( selectedObject );
				animate();
			}*/
			
			//capture d'écran
			function capture(e){
				//Listen to 'P' key
				if(e.which !== 80) return;  
				try {
					window.open(renderer.domElement.toDataURL("image/png"));      
				} 
				catch(e) {
					console.log("Browser does not support taking screenshot of 3d context");
					return;
				}

			}
			
			
			//retire de la scène tous les éléments du contexte
			function clearContexte() {
				var to_remove = [];

				scene.traverse ( function( child ) {
					if ( (child instanceof THREE.Mesh || child instanceof THREE.Line) && !child.userData.focus === true && !child.userData.fond === true ) {
						to_remove.push( child );
					 }
				} );

				for ( var i = 0; i < to_remove.length; i++ ) {
					scene.remove( to_remove[i] );
				}
			}
			
			
			//crée le material texturé associé aux arêtes sketchy
			function createMaterial(width){

				var texture = THREE.ImageUtils.loadTexture( "pencil1-tiled-136-135.png" );
				var texture2 = THREE.ImageUtils.loadTexture( "paint-brush.png" );
				var texture3 = THREE.ImageUtils.loadTexture( "chalk1-155-142.png" );
				/*texture.wrapS = THREE.RepeatWrapping;
				texture.repeat.set( 0.1, 0.1 );
				texture.anisotropy = 10;
				texture.anisotropy = 10;*/
				var color = new THREE.Color().setHex(params.color_aretes_focus.replace("#", "0x"));

				//Materiel appliqué à toutes les géométries de la couche
				var material = new THREE.ShaderMaterial( {

					uniforms: {
						time: { value: 1.0 },
						thickness : { value: width },
						resolution: { value: new THREE.Vector2(window.innerWidth,window.innerHeight) }, // todo: vraie resolution
						texture1: { type: "t", value: texture },
						texture2: { type: "t", value: texture2 },
						texture3: { type: "t", value: texture3 },
						color : {type: 'v3', value: [color.r,color.g,color.b]}
					},
					vertexShader: document.getElementById( 'vertexShader' ).textContent,
					fragmentShader: document.getElementById( 'fragmentShader' ).textContent

				} );
				material.transparent = true;
				material.polygonOffset = true;
				material.polygonOffsetUnits = -150.0

				return material;
			}

           
		   //crée les six points pour deux triangles (un quad) à partir d'une arête
			function createQuad(pt1,pt2){

				//Définition propre a chaque géométrie
				var geometry = new THREE.BufferGeometry();

				//les 6 points
				var vertices = new Float32Array( [
					pt1.x, pt1.y,  pt1.z, // -1
					pt2.x, pt2.y,  pt2.z, // -1
					pt2.x, pt2.y,  pt2.z, //  1

					pt2.x, pt2.y,  pt2.z, //  1
					pt1.x, pt1.y,  pt1.z, //  1
					pt1.x, pt1.y,  pt1.z  // -1
				] );

				//pour chacun des six points, le point opposé correspondant
				var vertices2 = new Float32Array( [
					pt2.x, pt2.y,  pt2.z,
					pt1.x, pt1.y,  pt1.z,
					pt1.x, pt1.y,  pt1.z,


					pt1.x, pt1.y,  pt1.z,
					pt2.x, pt2.y,  pt2.z,
					pt2.x, pt2.y,  pt2.z
				] );



				geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
				geometry.addAttribute( 'position2', new THREE.BufferAttribute( vertices2, 3 ) );

				var uv = new Float32Array( [
					-1, -1,
					1, -1,
					1,  1,

					1, 1,
					-1, 1,
					-1,-1
				] );


				geometry.addAttribute( 'uv', new THREE.BufferAttribute( uv, 2 ) );

				return geometry;
			}

			function changeMat(array, mat){
					for (i=0; i<array.length; i++){
						array[i].material = mat;
						array.materialNeedsUpdate = true;
					}
			}
