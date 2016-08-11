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
				
				
			
			//capture d'écran
			function capture(e){
				//Listen to 'equal sign' key
				if(e.which !== 187) return;  
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



			function getFirstElementFromUserData(key, value) {
				var elements = [];

				scene.traverse ( function( child ) {
					if ( child.userData[key] === value) {
						elements.push( child );
					 }
				} );

				return elements[0];
			}
			
			
			//crée le material texturé associé aux arêtes sketchy
			function createMaterial(shader, width, value, color){

				//texture des petits segments
				var texture1 = THREE.ImageUtils.loadTexture( "strokes/"+value+"_small.png" );

				//texture des grands segments
				var texture = THREE.ImageUtils.loadTexture( "strokes/"+value+".png" );

				var vertex = getSourceSynch("shaders/"+shader+"_vert.glsl");
				var fragment = getSourceSynch("shaders/"+shader+"_frag.glsl");

				//Materiel appliqué à toutes les géométries de la couche
				var material = new THREE.ShaderMaterial( {

					vertexShader : vertex,
					fragmentShader : fragment,
					uniforms: 
						{
						width : { type: "f", value: width },
						resolution: { value: new THREE.Vector2(window.innerWidth,window.innerHeight) }, // todo: vraie resolution
						texture1: { type: "t", value: texture1 },
						image: { type: "t", value: texture },
						//texture3: { type: "t", value: texture2 },
						color : {type: 'v3', value: [color.r,color.g,color.b]}
					}

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
							var mat = new THREE.MeshLambertMaterial( {map: null, color: couche.style.parameters.fill.color, shading: THREE.SmoothShading} );
							textureLoader.load( couche.style.parameters.fill.parameters.URI, function( map ) {
								map.wrapS = THREE.RepeatWrapping;
								map.wrapT = THREE.RepeatWrapping;
								map.anisotropy = 4;
								map.repeat.set( couche.style.parameters.fill.parameters.repeat, couche.style.parameters.fill.parameters.repeat );
								mat.side = THREE.DoubleSide;
								mat.map = map;
								mat.needsUpdate = true;
							} );
						}else if (couche.style.parameters.fill.type === 'shader') {
							var id = couche.style.parameters.fill.parameters.id;
							var vertex = getSourceSynch("shaders/"+couche.style.parameters.fill.parameters.shader+"_vert.glsl");
							var fragment = getSourceSynch("shaders/"+couche.style.parameters.fill.parameters.shader+"_frag.glsl");
							var method = getMethod(couche.style.parameters.fill.parameters.shader);

							var color = new THREE.Color().setHex(couche.style.parameters.fill.color.replace("#", "0x"));
							//lampe située par défaut en dessous de la scène
							var lightPosition = new THREE.Vector3(defaults.lightPosition.x,defaults.lightPosition.y,defaults.lightPosition.z);
							var dirLight = getFirstLightByType('directional');
							if (dirLight !== undefined){
								lightPosition = new THREE.Vector3( dirLight.position.x, dirLight.position.y, dirLight.position.z );
							}

							var uniforms = {ambient: { type: 'f', value : 0 }};

							for (param in method.uniforms){
								uniforms[param] = method.uniforms[param];
								uniforms[param].value = eval(method.uniforms[param].value);
							}
			
							var material = new THREE.ShaderMaterial( {

								uniforms: uniforms,
								//method.uniforms,  
								/*THREE.UniformsUtils.merge( [
									//THREE.UniformsLib[ "shadowmap" ],
									{
									ambient: { type: 'f', value : 0 },
									diffuse: { type: 'f', value : couche.style.parameters.fill.parameters.diffuse },
									rim: { type: 'f', value : 0.1 },
									specular: { type: 'f', value : 0 },
									shininess: { type: 'f', value : 1 },
									color: { type: 'v4', value: new THREE.Vector3( color.r, color.g,color.b ) },
									opacity: { type: 'f', value: couche.style.parameters.fill.opacite },
									lightPosition: { type: 'v3', value: lightPosition },
									hatch1: { type: 't', value: THREE.ImageUtils.loadTexture( './textures/'+id + '0.jpg' ) },
									hatch2: { type: 't', value: THREE.ImageUtils.loadTexture( './textures/'+id + '1.jpg' ) },
									hatch3: { type: 't', value: THREE.ImageUtils.loadTexture( './textures/'+id + '2.jpg' ) },
									hatch4: { type: 't', value: THREE.ImageUtils.loadTexture( './textures/'+id + '3.jpg' ) },
									hatch5: { type: 't', value: THREE.ImageUtils.loadTexture( './textures/'+id + '4.jpg' ) },
									hatch6: { type: 't', value: THREE.ImageUtils.loadTexture( './textures/'+id + '5.jpg' ) },
									paper: {type: 't', value: THREE.ImageUtils.loadTexture( './textures/paper2.png' ) },
									repeat: { type: 'f', value: couche.style.parameters.fill.parameters.repeat }
									//lights : true
								}
								])*/
								
								vertexShader:   vertex,
								fragmentShader: fragment

							});

							material.side = THREE.DoubleSide;

							if (couche.style.parameters.fill.parameters.shader === "hatching")
							
							{material.uniforms.paper.value.generateMipmaps = false;
							material.uniforms.paper.value.magFilter = THREE.LinearFilter;
							material.uniforms.paper.value.minFilter = THREE.LinearFilter;
					
							material.uniforms.hatch1.value.wrapS = material.uniforms.hatch1.value.wrapT = THREE.RepeatWrapping;
							material.uniforms.hatch2.value.wrapS = material.uniforms.hatch2.value.wrapT = THREE.RepeatWrapping;
							material.uniforms.hatch3.value.wrapS = material.uniforms.hatch3.value.wrapT = THREE.RepeatWrapping;
							material.uniforms.hatch4.value.wrapS = material.uniforms.hatch4.value.wrapT = THREE.RepeatWrapping;
							material.uniforms.hatch5.value.wrapS = material.uniforms.hatch5.value.wrapT = THREE.RepeatWrapping;
							material.uniforms.hatch6.value.wrapS = material.uniforms.hatch6.value.wrapT = THREE.RepeatWrapping;

							material.depthWrite = true;} /*else {
								material.uniforms.bmap.value.repeat.set(couche.style.parameters.fill.parameters.repeat,couche.style.parameters.fill.parameters.repeat);
								material.uniforms.smap.value.repeat.set(couche.style.parameters.fill.parameters.repeat,couche.style.parameters.fill.parameters.repeat);
								material.uniforms.bmap.value.wrapS = material.uniforms.bmap.value.wrapT = THREE.RepeatWrapping;
								material.uniforms.smap.value.wrapS = material.uniforms.smap.value.wrapT = THREE.RepeatWrapping;
								var phongShader = THREE.ShaderLib.phong;
								material.uniforms = THREE.UniformsUtils.merge( [THREE.UniformsUtils.clone(phongShader.uniforms),material.uniforms]);
							}*/

							mat = material;

						} else if (couche.style.parameters.fill.type === 'bump'){

							if (couche.style.parameters.fill.parameters.bmap === undefined){
								couche.style.parameters.fill.parameters.bmap = "./textures/brick_bump.jpg";
							}
							if (couche.style.parameters.fill.parameters.smap === undefined){
								couche.style.parameters.fill.parameters.smap = "./textures/brick_diffuse.jpg";
							}
							if (couche.style.parameters.fill.parameters.repeat === undefined){
								couche.style.parameters.fill.parameters.repeat = 0.1;
							}

							var bmap =  THREE.ImageUtils.loadTexture(couche.style.parameters.fill.parameters.bmap, {}, function(){});
							var smap =  THREE.ImageUtils.loadTexture(couche.style.parameters.fill.parameters.smap, {}, function(){});
							bmap.wrapS = bmap.wrapT = THREE.RepeatWrapping;
							smap.wrapS = smap.wrapT = THREE.RepeatWrapping;
							//var repeat = 0.1;
							bmap.repeat.set(couche.style.parameters.fill.parameters.repeat,couche.style.parameters.fill.parameters.repeat);
							smap.repeat.set(couche.style.parameters.fill.parameters.repeat,couche.style.parameters.fill.parameters.repeat);
							var color = new THREE.Color().setHex(couche.style.parameters.fill.color.replace("#", "0x"));

							mat = new THREE.MeshPhongMaterial({
								color : color,
								shininess  :  20,
								bumpMap    :  bmap,
								map        :  smap,
								bumpScale  :  0.45,
								side 	   :  THREE.DoubleSide
							});

						} else {
							console.log("Le type "+couche.style.parameters.fill.type+" n\'est pas valide pour une surface")
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
						}else {
							console.log("Le type "+couche.style.parameters.stroke.type+" n\'est pas valide pour une arête")
						}

				return lineMat;

			}

			function quadMatFromLayer (couche) {

				var quadMat = createMaterial(couche.style.parameters.stroke.parameters.shader, couche.style.parameters.stroke.parameters.width, couche.style.parameters.stroke.parameters.image, new THREE.Color().setHex(couche.style.parameters.stroke.color.replace("#", "0x")));
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
			}

			function getFirstLightByType (type) {
				for (var j = 0; j < parse.parameters.lights.length; j++){
						if (parse.parameters.lights[j].type === type){
							return parse.parameters.lights[j];
						}
				}
			}



			//ajout d'une couche avec des paramètres par défaut
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
					position : {displacement : {x:0, y:0, z:0},rotation : {x:0, y:0, z:0},scale : {x:1.0, y:1.0, z:1.0}},
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


			function getFaces(couche, array){
				scene.traverse ( function( child ) {
					if ( child instanceof THREE.Mesh && child.userData.couche === couche.id && child.userData.quad !== true ) {
						array.push( child );
					}
				} );
			}
			function getQuads(couche, array){
				scene.traverse ( function( child ) {
					if ( child instanceof THREE.Mesh && child.userData.couche === couche.id && child.userData.quad === true ) {
						array.push( child );
					}
				} );
			}


			function getSourceSynch(url) {
				var req = new XMLHttpRequest();
				req.open("GET", url, false);
				req.send(null);
				return req.responseText;
			};

			function getMethod(shader){

				var text = getSourceSynch('./methods/'+shader+'.json');
				var method = JSON.parse(text);
				return method;
			}


			//création ou activation des sliders dat.gui pour les surfaces en shader
			function slidersShader(couche,shader){
						var method = getMethod(shader);
						for (var j in method.parameters){
							var parameter = method.parameters[j];
							if (couche.style.parameters.fill.parameters[parameter.name] === undefined){
								couche.style.parameters.fill.parameters[parameter.name] = parameter.default;
							}	
							if (parameter.GUI.visible === true){
								params[parameter.name+"Fill"+couche.id] = couche.style.parameters.fill.parameters[parameter.name];
								if (document.getElementById(parameter.name+"Fill"+couche.id) === null){
									if (parameter.type === 'float'){
										gui.__folders[couche.name].add( params, parameter.name+"Fill"+couche.id, parameter.GUI.min,parameter.GUI.max,parameter.GUI.step ).name(parameter.name).listen();
									} else if (parameter.type === 'string'){
										gui.__folders[couche.name].add( params, parameter.name+"Fill"+couche.id, parameter.GUI.list ).name(parameter.name).listen();
									}
									gui.__folders[couche.name].__ul.lastChild.id = parameter.name+"Fill"+couche.id;
								} else {
									elementVisible(parameter.name+"Fill"+couche.id,true);
								}			
							}
						}
			}

