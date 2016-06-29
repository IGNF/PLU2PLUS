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
				
				
			function loadObjMtl(fileMTL, fileOBJ, transX, transY, transZ, nom, visible){	
				
				var mtlLoader = new THREE.MTLLoader();
				mtlLoader.load( fileMTL, function( materials ) {
				
					materials.preload();
		
					//loader du fichier .obj
					var objLoader = new THREE.OBJLoader();
					objLoader.setMaterials( materials );
					objLoader.load( fileOBJ, function ( object ) {

						object.traverse( function ( child ) {

								if ( child instanceof THREE.Mesh) {
									child.material.needsUpdate = true;
									var cGeo = new THREE.Geometry().fromBufferGeometry(child.geometry);	
									var mesh = new THREE.Mesh(cGeo);
									var chId = parseInt(child.material.name);
										

									var material = materials.materials[chId];
									material.side = THREE.DoubleSide;
									material.shininess = 1.0;
									var mesh = new THREE.Mesh(cGeo, material);
									if (nom === 'parcelle' || nom === 'photo'){
										mesh.userData = {fond : true};
										//mesh.renderOrder = 3;
									}
									mesh.name = nom+chId;
									mesh.visible = visible;
									moveMesh(mesh, transX, transY, transZ);

									scene.add(mesh);

								}
						} );
					});
				
				});
				
			}
			
			
				function loadObjFocus(fileObj, matMur, matToit, arrayMur, arrayToit, arrayAretes, arrayQuads, lineMat, quadMat){

					var objLoader = new THREE.OBJLoader();
					
					objLoader.load(fileObj, function ( object ) {
				
					object.traverse( function ( child ) {

							if ( child instanceof THREE.Mesh ) {

									var geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
									
									assignUVs(geometry);

									var mesh = new THREE.Mesh(geometry);
									
									var edges = new THREE.EdgesHelper(mesh);

									var geom = edges.geometry;
									var vvv = geom.getAttribute('position');

									//var material = createMaterial(10.0);



									
									var line = new THREE.Line( geo2line(edges.geometry), lineMat, THREE.LinePieces );
									moveMesh(line, -40, 0, -9.4);
									
									if (child.name.endsWith("non")){
										child.visible = false;
									}else if(child.name.startsWith("mur")){
										for ( i = 0; i < vvv.length-5; i=i+6 ) {
											var lineGeom = createQuad(new THREE.Vector3( vvv.array[i], vvv.array[i+1],  vvv.array[i+2] ),new THREE.Vector3( vvv.array[i+3], vvv.array[i+4],  vvv.array[i+5] ));
											var mesh = new THREE.Mesh( lineGeom, quadMat );
											arrayQuads.push(mesh);
											scene.add(mesh);
											moveMesh(mesh, -40, 0, -9.4);
										}
										var meshWall = new THREE.Mesh(geometry, matMur);
										moveMesh(meshWall, -40, 0, -9.4);
										meshWall.renderOrder = 1;
										meshWall.userData = {focus : true};
										line.userData = {focus : true};
										scene.add(meshWall);
										scene.add(line);
										arrayAretes.push(line);
										arrayMur.push(meshWall);


									}else{
										for (var k=0; k<child.geometry.attributes.normal.array.length; k++){
											child.geometry.attributes.normal.array[k] = -child.geometry.attributes.normal.array[k];
										}
										var meshRoof = new THREE.Mesh(geometry, matToit);
										for ( i = 0; i < vvv.length-5; i=i+6 ) {
											var lineGeom = createQuad(new THREE.Vector3( vvv.array[i], vvv.array[i+1],  vvv.array[i+2] ),new THREE.Vector3( vvv.array[i+3], vvv.array[i+4],  vvv.array[i+5] ));
											var mesh = new THREE.Mesh( lineGeom, quadMat );
											arrayQuads.push(mesh);
											scene.add(mesh);
											moveMesh(mesh, -40, 0, -9.4);
										}
										moveMesh(meshRoof, -40, 0, -9.4);
										meshRoof.renderOrder = 2;
										meshRoof.userData = {focus : true};
										line.userData = {focus : true};
										scene.add(meshRoof);
										arrayAretes.push(line);
										arrayToit.push(meshRoof);
										scene.add(line);

									}
									
							}

					} );
				
				});
			}
			
			function loadObj(fileObj, mat, lineMat, arrayLine, arrayMesh, transZ, visible){
					var objLoader = new THREE.OBJLoader();
					
					objLoader.load(fileObj, function ( object ) {
				
					object.traverse( function ( child ) {

							if ( child instanceof THREE.Mesh ) {


									//var lineMat = new THREE.LineBasicMaterial( { color: couleur_aretes_focus, linewidth: 3, transparent: true, opacity: opacite_aretes_focus } );
									//var lineMat = new THREE.LineDashedMaterial( { color: params.color_aretes_contexte, dashSize: 0.7, gapSize: 1 } );
									var geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
									
									assignUVs(geometry);

									var mesh = new THREE.Mesh(geometry,mat);
									
									
									var edges = new THREE.EdgesHelper(mesh, lineMat, 30);
									
									var line = new THREE.Line( geo2line(edges.geometry), lineMat, THREE.LinePieces );
									
									//console.log(fileObj.indexOf('Mur') !== -1);
									if (fileObj.indexOf('Mur') !== -1){
										mesh.renderOrder = 1;
									}else{
										mesh.renderOrder = 2;
									}

									mesh.visible = visible;
									line.visible = visible;

									arrayLine.push(line);
									arrayMesh.push(mesh);

									moveMesh(mesh, 0, 0, transZ);
									moveMesh(line, 0, 0, transZ);
									
									scene.add(mesh);
									scene.add(line);

									
							}

					} );


				});
				
			}
			
			function removeEntity(name) {
				var selectedObject = scene.getObjectByName(name);
				scene.remove( selectedObject );
				animate();
			}
			
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
			
			
			function saveScreenshot(zip){
				try {
					nbImage++;
					var img = renderer.domElement.toDataURL("image/png");
					var index = img.indexOf(",");
					var base = img.substring(index+1,img.length);
					zip.file('Image'+nbImage+'.png', base, {base64: true});
				}catch(zip){					
					console.log("Browser does not support taking screenshot of 3d context");
					return;
				}
			}
			
			function downloadAll(zip){
				zip.generateAsync({type:"blob"})
				.then(function (blob) {
					saveAs(blob, "images.zip");
				});
			}
			
			function resetCam(camera){
				camera.position.set(-300,425,325);
				controls.target.set( -50, 30, 0 );
			}
			
			
			function emptyZip(zip){
				nbImage = 0;
				var i = 1;
				for (var image in zip.files){
					zip.remove('Image'+i+'.png');
					i++;
				}
				//return zip;
			}
			
			function createMaterial(width){

				var texture = THREE.ImageUtils.loadTexture( "paint-brush.png" );
				//texture.wrapT =texture.wrapS = THREE.RepeatWrapping;
				texture.repeat.set( 0.1, 0.1 );
				texture.anisotropy = 10;

				//Materiel appliqué à toutes les géométries de la couche
				var material = new THREE.ShaderMaterial( {

					uniforms: {
						time: { value: 1.0 },
						thickness : { value: width },
						resolution: { value: new THREE.Vector2(window.innerWidth,window.innerHeight) }, // todo: vraie resolution
						texture1: { type: "t", value: texture }
					},
					vertexShader: document.getElementById( 'vertexShader' ).textContent,
					fragmentShader: document.getElementById( 'fragmentShader' ).textContent

				} );
				material.transparent = true;


				return material;
			}

           
			function createQuad(pt1,pt2){

				//Définition propre a chaque géométrie
				var geometry = new THREE.BufferGeometry();

				var vertices = new Float32Array( [
					pt1.x, pt1.y,  pt1.z, // -1
					pt2.x, pt2.y,  pt2.z, // -1
					pt2.x, pt2.y,  pt2.z, //  1

					pt2.x, pt2.y,  pt2.z, //  1
					pt1.x, pt1.y,  pt1.z, //  1
					pt1.x, pt1.y,  pt1.z  // -1
				] );

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
					opacity = new Float32Array( geometry.attributes.position.count );

				var uv = new Float32Array( [
					-1, -1,
					1, -1,
					1,  1,

					1, 1,
					-1, 1,
					-1,-1
				] );



				for(var i= 0; i < geometry.attributes.position.count ;i ++){
					opacity[i] = Math.random();
				}

				geometry.addAttribute( 'opacity', new THREE.BufferAttribute( opacity, 1 ) );
				geometry.addAttribute( 'uv', new THREE.BufferAttribute( uv, 2 ) );

				return geometry;
			}
