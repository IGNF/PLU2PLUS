			//chargement d'une couche unique
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

			//chargement de l'ensemble des couches au démarrage
			function loadLayers() {
				var objLoader = new THREE.OBJLoader();
				
				var couchesTex = [];
					for (j in parse.couches){
						var couche = parse.couches[j];
						var mat = matFromLayer(couche);
						var lineMat = lineMatFromLayer(couche);

						if (couche.URI.endsWith(".obj")){
				
							if (couche.style.parameters.fill.type === 'texture') {
									couchesTex.push(couche);
							} 
							else {
								loading(objLoader, mat, lineMat, couche, couchesTex);
							}	
						} else if (couche.URI.endsWith(".json")){
							   loading2D(lineMat, mat, couche);
						}

					}
					loadTex(couchesTex, objLoader);
			}

			function loading2D (lineMat, mat, couche){
				$.getJSON(couche.URI, function (data) { 
					drawThreeGeo(data, 10, 'plane', lineMat, mat, couche) ;
				});
			}
			





			//chargement et initialisation d'une couche
			function loading(objLoader, mat, lineMat, couche, couchesTex) {
				objLoader.load(couche.URI, function ( object ) {
				
					object.traverse( function ( child ) {

							if ( child instanceof THREE.Mesh ) {

									var geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);

									if (couche.style.parameters.fill.type === 'texture') {
										mat = child.material;
										mat.side = THREE.DoubleSide;
										mat.shininess = 1.0;
									} else {
										assignUVs(geometry);
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


									mesh.renderOrder = couche.order;
									line.renderOrder = couche.order;

									moveMesh(mesh, couche.position.displacement.x, couche.position.displacement.y, couche.position.displacement.z);
									moveMesh(line, couche.position.displacement.x, couche.position.displacement.y, couche.position.displacement.z);
									mesh.rotation.set(couche.position.rotation.x,couche.position.rotation.y,couche.position.rotation.z);
									line.rotation.set(couche.position.rotation.x,couche.position.rotation.y,couche.position.rotation.z);
									mesh.scale.set(couche.position.scale.x,couche.position.scale.y,couche.position.scale.z);
									line.scale.set(couche.position.scale.x,couche.position.scale.y,couche.position.scale.z);

									mesh.userData = {couche : couche.id};
									line.userData = {couche : couche.id};

									mesh.castShadow = true;
									mesh.receiveShadow = true;

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

			//chargement des paramètres dat.GUI des couches
			function loadParams() {
				for (j in parse.couches){
					initGUICouche (parse.couches[j]);
				}
			}

			//chargement de l'éclairage
			function loadLights() {
				for (var j = 0; j < parse.parameters.lights.length; j++){
					var light = parse.parameters.lights[j];
					var lightToAdd;
					if (light.type === 'directional'){
						lightToAdd = new THREE.DirectionalLight(light.color, light.intensity);
						lightToAdd.position.set(light.position.x,light.position.y,light.position.z);
						lightToAdd.castShadow = true;
						lightToAdd.shadowDarkness = light.shadow.darkness;
						lightToAdd.shadow.camera.far = light.shadow.far;
						lightToAdd.shadow.camera.near = light.shadow.near;	

						lightToAdd.shadow.camera.top = lightToAdd.shadow.camera.right = light.shadow.camera_size;
						lightToAdd.shadow.camera.left = lightToAdd.shadow.camera.bottom  = -light.shadow.camera_size;

						lightToAdd.shadowMapHeight = lightToAdd.shadowMapWidth = light.shadow.map;    // power of 2
				
						//évite l'effet d'ombre du au DoubleSide des materials
						lightToAdd.shadowBias =  light.shadow.bias; 
					} else if (light.type === 'ambient'){
						lightToAdd = new THREE.AmbientLight(light.color, light.intensity);
					} else if (light.type === 'point'){
						lightToAdd = new THREE.PointLight(light.color, light.intensity, light.distance);
					} else if (light.type === 'spot'){
						lightToAdd = new THREE.SpotLight(light.color);
					} else if (light.type === 'hemisphere'){
						lightToAdd = new THREE.HemisphereLight(light.color, light.groundColor, light.intensity);
					} else {
						console.log(light.type+" n\'est pas un type valide de THREE.Light")
					}
					lightToAdd.userData = {typelight : light.type, light : j};
					scene.add(lightToAdd);
				}
			}


			//chargement de la caméra et des contrôles
			function loadCam(WIDTH, HEIGHT) {
				if (parse.parameters.camera.type === 'ortho') {
					camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, parse.parameters.camera.near, parse.parameters.camera.far); 
				} else {
					camera = new THREE.PerspectiveCamera(parse.parameters.camera.fov, WIDTH / HEIGHT, parse.parameters.camera.near, parse.parameters.camera.far);
				}

				camera.position.set(parse.parameters.camera.position.x,parse.parameters.camera.position.y,parse.parameters.camera.position.z);
				camera.up.set(0,0,1);
				scene.add(camera);

				//controls
				controls = new THREE.OrbitControls(camera, renderer.domElement);
				controls.target.set(parse.parameters.camera.target.x,parse.parameters.camera.target.y,parse.parameters.camera.target.z);


			}


