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
										mesh.renderOrder = 4;
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
									
									var line = new THREE.Line( geo2line(edges.geometry), lineMat, THREE.LinePieces );
									moveMesh(line, -40, 0, -9.4);
									
									if (child.name.endsWith("non")){
										child.visible = false;
									}else if(child.name.startsWith("mur")){
										for ( i = 0; i < vvv.length-5; i=i+6 ) {
											var lineGeom = createQuad(new THREE.Vector3( vvv.array[i], vvv.array[i+1],  vvv.array[i+2] ),new THREE.Vector3( vvv.array[i+3], vvv.array[i+4],  vvv.array[i+5] ));
											var mesh = new THREE.Mesh( lineGeom, quadMat );
                                            mesh.userData = {focus : true};
											arrayQuads.push(mesh);

											mesh.renderOrder = 1;
                                            
											scene.add(mesh);
											moveMesh(mesh, -40, 0, -9.35);
										}
										var meshWall = new THREE.Mesh(geometry, matMur);
										moveMesh(meshWall, -40, 0, -9.4);
										meshWall.renderOrder = 2;
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
                                            mesh.userData = {focus : true};
											mesh.renderOrder = 3;
											arrayQuads.push(mesh);
											scene.add(mesh);
											moveMesh(mesh, -40, 0, -9.35);
										}
										moveMesh(meshRoof, -40, 0, -9.4);
										meshRoof.renderOrder = 3;
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

									var geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
									
									assignUVs(geometry);

									var mesh = new THREE.Mesh(geometry,mat);
									
									
									var edges = new THREE.EdgesHelper(mesh, lineMat, 30);
									
									var line = new THREE.Line( geo2line(edges.geometry), lineMat, THREE.LinePieces );
									
									//console.log(fileObj.indexOf('Mur') !== -1);
									if (fileObj.indexOf('Mur') !== -1){
										mesh.renderOrder = 3;
									}else{
										mesh.renderOrder = 4;
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