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
						

					//new THREE.Vector2(3* Math.round(-1+(v1[components[0]] - min[components[0]])/3.0), (v1[components[1]] - min[components[1]])),
					//new THREE.Vector2(3* Math.round(-1+(v2[components[0]] - min[components[0]])/3.0), (v2[components[1]] - min[components[1]]) ),
					//new THREE.Vector2(3* Math.round(-1+(v3[components[0]] - min[components[0]])/3.0), (v3[components[1]] - min[components[1]]))
						
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
				//Listen to 'Down arrow' key
				if(e.which !== 40) return;  
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
					if ( (child instanceof THREE.Mesh || child instanceof THREE.Line) && !child.userData.focus === true && !child.userData.fond === true && !child.userData.arbre === true ) {
						to_remove.push( child );
					 }
				} );

				for ( var i = 0; i < to_remove.length; i++ ) {
					scene.remove( to_remove[i] );
				}
			}

			//retire de la scène tous les quads de la couche
			function clearQuads(couche) {
				var to_remove = [];

				scene.traverse ( function( child ) {
					if ( child.userData.quad === true && child.userData.couche === couche.id) {
						to_remove.push( child );
					 }
				} );

				for ( var i = 0; i < to_remove.length; i++ ) {
					scene.remove( to_remove[i] );
				}
			}

			//retire de la scène tous les éléments de la couche
			function clearCouche(couche) {
				var to_remove = [];

				scene.traverse ( function( child ) {
					if (child.userData.couche === couche.id) {
						to_remove.push( child );
					 }
				} );

				for ( var i = 0; i < to_remove.length; i++ ) {
					scene.remove( to_remove[i] );
				}
			}
			
			
			//crée le material texturé associé aux arêtes sketchy
			function createMaterial(width, value, color){

				//var texture = THREE.ImageUtils.loadTexture( "strokes/pencil1-tiled-136-135.png" );
				var texture = THREE.ImageUtils.loadTexture( "strokes/small.png" );
				//var texture2 = THREE.ImageUtils.loadTexture( "strokes/paint-brush.png" );
				var texture2 = THREE.ImageUtils.loadTexture( value );
				//var texture3 = THREE.ImageUtils.loadTexture( "strokes/"+value+".png" );
				//var texture3 = THREE.ImageUtils.loadTexture( "strokes/chalk1-155-142.png" );
				var paper = THREE.ImageUtils.loadTexture("paper2.png");
				/*texture.wrapS = THREE.RepeatWrapping;
				texture.repeat.set( 0.1, 0.1 );
				texture.anisotropy = 10;
				texture.anisotropy = 10;*/
				//var color = new THREE.Color().setHex(params.color_aretes_focus.replace("#", "0x"));

				//Materiel appliqué à toutes les géométries de la couche
				var material = new THREE.ShaderMaterial( {

					uniforms: {
						time: { value: 1.0 },
						thickness : { value: width },
						resolution: { value: new THREE.Vector2(window.innerWidth,window.innerHeight) }, // todo: vraie resolution
						texture1: { type: "t", value: texture2 },
						texture2: { type: "t", value: texture2 },
						texture3: { type: "t", value: texture2 },
						paper: { type: "t", value: paper },
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


			function mergeMeshes (meshArr) {
				var geometry = new THREE.Geometry(),
					materials = [],
					m,
					materialPointer = 0,
					reindex = 0;

				for (var i = 0; i < meshArr.length; i++) {
					m = meshArr[i];

					if (m.material.materials) {
						for (var j = 0; j < m.material.materials.length; j++) {
							materials[materialPointer++] = m.material.materials[j];
						}
					} else if (m.material) {
						materials[materialPointer++] = m.material;
					}
					geometry.merge(m.geometry, m.matrix, reindex);
					reindex = materialPointer;
				}
				return new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
			}


			function matFromLayer (couche) {
						if (couche.style.parameters.fill.type === 'uni') {
							var mat = new THREE.MeshLambertMaterial({
								color: couche.style.parameters.fill.color, 
								side: THREE.DoubleSide, 
								transparent : (couche.style.parameters.fill.opacite < 1.0), 
								opacity : couche.style.parameters.fill.opacite});		
						}else if (couche.style.parameters.fill.type === 'texture') {
							var mat = new THREE.MeshLambertMaterial( {color: couche.style.parameters.fill.color} );

						}else if (couche.style.parameters.fill.type === 'image') {
							var textureLoader = new THREE.TextureLoader();
							var mat = new THREE.MeshLambertMaterial( {map: null, color: 0xffffff, shading: THREE.SmoothShading} );
							textureLoader.load( couche.style.parameters.fill.parameters.URI, function( map ) {
								map.wrapS = THREE.RepeatWrapping;
								map.wrapT = THREE.RepeatWrapping;
								map.anisotropy = 4;
								map.repeat.set( 0.4, 0.4 );
								mat.side = THREE.DoubleSide;
								mat.map = map;
								mat.needsUpdate = true;
							} );
						}


				return mat;

			}

			function lineMatFromLayer (couche) {

						var color = couche.style.parameters.stroke.color;
						var opacity = couche.style.parameters.stroke.opacite;
						var transparent = (opacity <1.0 );
						if (couche.style.parameters.stroke.type === 'Continu') {
							var lineMat = new THREE.LineBasicMaterial({color: color, opacity: opacity ,transparent: transparent  } );
						} else if (couche.style.parameters.stroke.type === 'Tirets'){
							var lineMat = new THREE.LineDashedMaterial({color: color, opacity: opacity ,transparent: transparent });
								//, dashSize : couche.style.parameters.stroke.parameters.dash, gapSize : couche.style.parameters.stroke.parameters.gap  } );
						}else if (couche.style.parameters.stroke.type === 'Invisible'){
							var lineMat = new THREE.LineBasicMaterial({color: color, visible : false } );
						}else if(couche.style.parameters.stroke.type === 'Sketchy'){ 
							var lineMat = new THREE.LineBasicMaterial({color: color, opacity: 0.0 ,transparent: true, visible : false } );
						}	

				return lineMat;

			}

			function quadMatFromLayer (couche) {

				var quadMat = createMaterial(couche.style.parameters.stroke.parameters.width, couche.style.parameters.stroke.parameters.URI, new THREE.Color().setHex(couche.style.parameters.stroke.color.replace("#", "0x")));
				return quadMat;

			}


			function elementVisible(id, visible){
				$(document.getElementById(id)).attr("hidden", !visible);	
			}


			function getCoucheByName (name) {
				for (var j = 0; j < parse.couches.length; j++){
						if (parse.couches[j].name === name){
							return parse.couches[j];
						}
				}

				//return couche;
			}




			function addCouche (URI){
				var maxOrder = 0;
				for (var j = 0; j < parse.couches.length; j++){
					if (parse.couches[j].order > maxOrder){
						maxOrder = parse.couches[j].order;
					}
				}

				var nvCouche = {
					id : newID,
					name : "Default"+newID,
					URI : URI,
					position : {displacement : {x:0, y:0, z:0},rotation : {x:0, y:0, z:0},scale : {x:1, y:1, z:1}},
					style : {name : "Default", parameters : {fill : {opacite : 0.99, color : "#ce7157", type : "uni"}, stroke : {opacite : 1.0, color : "#ffffff", type : "Continu"}}},
					order : maxOrder - 1
				};

				parse.couches[parse.couches.length] = nvCouche;
				loadCouche(nvCouche);
				initGUICouche(nvCouche);
				newID++;
			}

			
			function clearParse (couche){

				var index = parse.couches.indexOf(couche);
				if (index > -1) {
					parse.couches.splice(index, 1);
				}
				//gui.__folders[couche.name].__ul.hidden = true;
				delete gui.__folders[couche.name];
				document.getElementById("folder"+couche.id).remove();
			}


