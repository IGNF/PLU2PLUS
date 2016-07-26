function loadObjMtl(fileMTL, fileOBJ, transX, transY, transZ, nom, visible){	
				
				var mtlLoader = new THREE.MTLLoader();
				mtlLoader.load( fileMTL, function( materials ) {
				
					//materials.preload();
		
					//loader du fichier .obj
					var objLoader = new THREE.OBJLoader();
					//objLoader.setMaterials( materials );
					objLoader.load( fileOBJ, function ( object ) {

						object.traverse( function ( child ) {

								if ( child instanceof THREE.Mesh) {
									child.material.needsUpdate = true;
									var cGeo = new THREE.Geometry().fromBufferGeometry(child.geometry);	
									var mesh = new THREE.Mesh(cGeo);
									var chId = parseInt(child.material.name);
										

									//var material = materials.materials[chId];
									var material = matFromLayer(fileOBJ);
									material.side = THREE.DoubleSide;
									material.shininess = 1.0;
									//material.color = new THREE.Color(0xffffff);
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
			
			
				/*function loadObjFocus(fileObj, matMur, matToit, arrayMur, arrayToit, arrayAretes, arrayQuads, lineMat, quadMat){

					var objLoader = new THREE.OBJLoader();
					
					objLoader.load(fileObj, function ( object ) {
				
					object.traverse( function ( child ) {

							if ( child instanceof THREE.Mesh ) {

								for (j = 0; j < parse.couches.length; j++){
									if (parse.couches[j].name === fileObj){
										var couche = parse.couches[j];
										var matMur = matFromLayer(couche);
										var matToit = matFromLayer(couche);
										var lineMat = lineMatFromLayer(couche);
									}
								}

									var geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
									
									assignUVs(geometry);

									var mesh = new THREE.Mesh(geometry);
									
									var edges = new THREE.EdgesHelper(mesh);

									var geom = edges.geometry;
									var vvv = geom.getAttribute('position');
									
									var line = new THREE.Line( geo2line(edges.geometry), lineMat, THREE.LinePieces );
									moveMesh(line, -40, 0, -9.4);
									quadMat = quadMatFromLayer(fileObj);
									
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
										//line.renderOrder = 1;
										scene.add(meshRoof);
										arrayAretes.push(line);
										arrayToit.push(meshRoof);
										scene.add(line);

									}
									
							}

					} );
				
				});
			}*/

			/*function loadObj(fileObj, arrayLine, arrayMesh, visible){
					var objLoader = new THREE.OBJLoader();
					for (j = 0; j < parse.couches.length; j++){
						if (parse.couches[j].name === fileObj){
							var couche = parse.couches[j];
							var mat = matFromLayer(couche);
							var lineMat = lineMatFromLayer(couche);
						}
					}
					if (couche.style.parameters.fill.type === 'texture') {
						var mtlLoader = new THREE.MTLLoader();
													
						mtlLoader.load( couche.style.parameters.fill.parameters.URI, function( materials ) {
							materials.preload();

							objLoader.setMaterials( materials );
							loading( arrayLine, arrayMesh, visible, objLoader, mat, lineMat, couche );
						})
					}
					else {
						loading( arrayLine, arrayMesh, visible, objLoader,  mat, lineMat, couche );
					}

			}*/

			function loadCouche(couche){
				var objLoader = new THREE.OBJLoader();
				var mtlLoader = new THREE.MTLLoader();
				var mat = matFromLayer(couche);
				var lineMat = lineMatFromLayer(couche);
				if (couche.style.parameters.fill.type === 'texture') {
					mtlLoader.load( couche.style.parameters.fill.parameters.URI, function( materials ) {
									materials.preload();
									objLoader.setMaterials( materials );
									loading(objLoader, mat, lineMat, couche, []);
								})
				}
				else {
					loading(objLoader, mat, lineMat, couche, []);
				}

			}

			//chargement récursif des textures sur l'objet correspondant
			function loadTex(couchesTex, objLoader){
				var mtlLoader = new THREE.MTLLoader();
				if(couchesTex.length){
					mtlLoader.load( couchesTex[0].style.parameters.fill.parameters.URI, function( materials ) {
								materials.preload();
								objLoader.setMaterials( materials );
								var mat = matFromLayer(couchesTex[0]);
								var lineMat = lineMatFromLayer(couchesTex[0]);
								loading(objLoader, mat, lineMat, couchesTex.shift(), couchesTex);
							})

				}
			}

			function loadLayers() {
				var objLoader = new THREE.OBJLoader();
				
				var couchesTex = [];
					for (j = 0; j < parse.couches.length; j++){
						var couche = parse.couches[j];
						var mat = matFromLayer(couche);
						var lineMat = lineMatFromLayer(couche);
				
						if (couche.style.parameters.fill.type === 'texture') {
								couchesTex.push(couche);
						} 
						else {
							loading(objLoader, mat, lineMat, couche, couchesTex);
						}	
					}
					loadTex(couchesTex, objLoader);
			}
			






			function loading(objLoader, mat, lineMat, couche, couchesTex) {
				objLoader.load(couche.URI, function ( object ) {
				
					object.traverse( function ( child ) {

							if ( child instanceof THREE.Mesh ) {

									var geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
									

									if (couche.style.parameters.fill.type === 'texture') {
										mat = child.material;
										mat.side = THREE.DoubleSide;
										//mat.color = new THREE.Color().setHex(couche.style.parameters.fill.color.replace("#", "0x"));
									}


									var mesh = new THREE.Mesh(geometry,mat);
									
									
									var edges = new THREE.EdgesHelper(mesh, lineMat, 30);
									var vvv = edges.geometry.getAttribute("position");
									
									var line = new THREE.Line( geo2line(edges.geometry), lineMat, THREE.LinePieces );

									if (couche.style.parameters.stroke.type === 'Sketchy') {
										var quadMat = quadMatFromLayer(couche);
										for ( i = 0; i < vvv.length-5; i=i+6 ) {
											var lineGeom = createQuad(new THREE.Vector3( vvv.array[i], vvv.array[i+1],  vvv.array[i+2] ),new THREE.Vector3( vvv.array[i+3], vvv.array[i+4],  vvv.array[i+5] ));
											var quad = new THREE.Mesh( lineGeom, quadMat);
											quad.userData = {couche : couche.id, quad : true };
	
											moveMesh(quad, couche.position.displacement.x, couche.position.displacement.y, couche.position.displacement.z);
											quad.rotation.set(couche.position.rotation.x,couche.position.rotation.y,couche.position.rotation.z);
											quad.scale.set(couche.position.scale.x,couche.position.scale.y,couche.position.scale.z);
											scene.add(quad);
										}
									}
									
									if (couche.name.indexOf('Mur') !== -1){
										mesh.renderOrder = 3;
									}else{
										mesh.renderOrder = 4;
									}

									moveMesh(mesh, couche.position.displacement.x, couche.position.displacement.y, couche.position.displacement.z);
									moveMesh(line, couche.position.displacement.x, couche.position.displacement.y, couche.position.displacement.z);
									mesh.rotation.set(couche.position.rotation.x,couche.position.rotation.y,couche.position.rotation.z);
									line.rotation.set(couche.position.rotation.x,couche.position.rotation.y,couche.position.rotation.z);
									mesh.scale.set(couche.position.scale.x,couche.position.scale.y,couche.position.scale.z);
									line.scale.set(couche.position.scale.x,couche.position.scale.y,couche.position.scale.z);

									mesh.userData = {couche : couche.id};
									line.userData = {couche : couche.id};

									scene.add(mesh);
									scene.add(line);

							}

					} );

					if (couche.style.parameters.fill.type === 'texture') {
						loadTex(couchesTex, objLoader);
						//loadTex(couchesTex, objLoader, mat, lineMat);
					}
				});

				
			}


			function loadParams() {
				for (j = 0; j < parse.couches.length; j++){
					initGUICouche (parse.couches[j]);
				}
			}



			/*function loadArbre(fileMTL,fileOBJ,pos){


				var mtlLoader = new THREE.MTLLoader();
				mtlLoader.load( fileMTL, function( materials ) {
				
					materials.preload();
		
					//loader du fichier .obj
					var objLoader = new THREE.OBJLoader();
					//objLoader.setMaterials( materials );
					objLoader.load( fileOBJ, function ( object ) {
						var arrMesh = [];

						object.traverse( function ( child ) {

								if ( child instanceof THREE.Mesh) {
									//child.material.needsUpdate = true;
									//child.material.side = THREE.DoubleSide;
									material = matFromLayer(fileOBJ);
									var cGeo = new THREE.Geometry().fromBufferGeometry(child.geometry);	
		
									var mesh = new THREE.Mesh(cGeo, material);

									arrMesh.push(mesh);



								}
						} );
						
						meshGeo = mergeMeshes(arrMesh);
						moveMesh(meshGeo, pos.x,pos.y,pos.z);
						var scale = 0.04;
						meshGeo.scale.set(scale,scale,scale);
						meshGeo.rotation.set(Math.PI/2,0,0);
						meshGeo.userData = {arbre : true};
						objects.push(meshGeo);
						positions.push(meshGeo.position);
						scene.add(meshGeo);

					});
				
				});

				
			}*/


