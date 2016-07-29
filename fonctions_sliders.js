		function echangeCouleurs(arrayMur, arrayToit) {
				coulToit = params.color_toit_focus;
				coulMur = params.color_mur_focus;
				choixCouleur(arrayMur,coulToit);
				choixCouleur(arrayToit,coulMur);
				params.color_toit_focus = coulMur;
				params.color_mur_focus = coulToit;
			}

			function assortirToit(arrayToit) {
				coulMur = params.color_mur_focus;
				choixCouleur(arrayToit,coulMur);
				params.color_toit_focus = coulMur;
			}

				
			//sauvegarde de la configuration des paramètres actuels dans un fichier
			function saveJSON(){
				params.arbres = JSON.stringify(positions);
				var txt = JSON.stringify(gui.getSaveObject(), undefined, 2);
				var textToSaveAsBlob = new Blob([txt], {type:"text/json"});
				var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
				var fileNameToSaveAs = gui.__preset_select.value;

			 
				var downloadLink = document.createElement("a");
				downloadLink.download = fileNameToSaveAs;
				downloadLink.innerHTML = "Download File";
				downloadLink.href = textToSaveAsURL;
				downloadLink.style.display = "none";
				document.body.appendChild(downloadLink);
			 
				downloadLink.click();
				


			}

			function saveConfig() {
				var txt = JSON.stringify(parse, undefined, '\t');
				var textToSaveAsBlob = new Blob([txt], {type:"text/json"});
				var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
				var fileNameToSaveAs = gui.__preset_select.value;

			 
				var downloadLink = document.createElement("a");
				downloadLink.download = fileNameToSaveAs;
				downloadLink.innerHTML = "Download File";
				downloadLink.href = textToSaveAsURL;
				downloadLink.style.display = "none";
				document.body.appendChild(downloadLink);
			 
				downloadLink.click();
				
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
				camera.position.set(parse.parameters.camera.position.x,parse.parameters.camera.position.y,parse.parameters.camera.position.z);
				controls.target.set( -50, 30, 0 );
			}

			function positionLight(value){
				light2.position.x = value;

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



			
			function changeColor(couche, value) {
				var to_change = [];

				var ancienne_value = couche.style.parameters.fill.color;

				if (ancienne_value !== value) {
					couche.style.parameters.fill.color = value;

					scene.traverse ( function( child ) {
						if ( child instanceof THREE.Mesh && child.userData.couche === couche.id ) {
							to_change.push( child );
						}
					} );

					for ( var i = 0; i < to_change.length; i++ ) {
						to_change[i].material.color = new THREE.Color().setHex(value.replace("#", "0x"));
						to_change[i].material.needsUpdate = true;
					}
				}
			}

			function changeColorAretes(couche, value) {
				var to_changeLine = [];
				var to_changeQuad = [];

				var ancienne_value = couche.style.parameters.stroke.color;

				if (ancienne_value !== value) {
					couche.style.parameters.stroke.color = value;
					var color = new THREE.Color().setHex(value.replace("#", "0x"));

					scene.traverse ( function( child ) {
						if ( child instanceof THREE.Line && child.userData.couche === couche.id ) {
							to_changeLine.push( child );
						} else if (child.userData.quad === true && child.userData.couche === couche.id) {
							to_changeQuad.push(child);
						}
					} );

					for ( var i = 0; i < to_changeLine.length; i++ ) {
						to_changeLine[i].material.color = color;
						to_changeLine[i].material.needsUpdate = true;
					}
					for ( var i = 0; i < to_changeQuad.length; i++ ) {
						to_changeQuad[i].material.uniforms.color.value = [color.r, color.g, color.b];   
						to_changeQuad[i].material.needsUpdate = true;
					}

				}
			}

			function changeOpacite(couche, value) {
				var to_change = [];
				var ancienne_value = couche.style.parameters.fill.opacite;

				//if (ancienne_value !== value) {
					couche.style.parameters.fill.opacite = value;

					scene.traverse ( function( child ) {
						if ( child instanceof THREE.Mesh && child.userData.couche === couche.id ) {
							to_change.push( child );
						}
					} );

					for ( var i = 0; i < to_change.length; i++ ) {
						to_change[i].material.opacity = value;
						/*if (couche.style.parameters.fill.type === 'texture'){
							to_change[i].material.transparent = true;
						} else {*/
							to_change[i].material.transparent = (value < 1.0);
						//}
							
						to_change[i].material.needsUpdate = true;
					}

				//}
			}

			function changeTypeAretes(couche, value) {

				var to_changeLine = [];
				var ancienne_value = couche.style.parameters.stroke.type;

				if (ancienne_value !== value) {
					couche.style.parameters.stroke.type = value;

					scene.traverse ( function( child ) {
						if ( child instanceof THREE.Line && child.userData.couche === couche.id ) {
							to_changeLine.push( child );
						}
					} );

					if (value !== 'Sketchy' && ancienne_value === 'Sketchy'){
						clearQuads(couche);
						elementVisible("uriStroke"+couche.id, false);
						elementVisible("widthStroke"+couche.id,false);
					}

					if (value === 'Sketchy'&& ancienne_value !== 'Sketchy') {
						couche.style.parameters.stroke.parameters = {};
						couche.style.parameters.stroke.parameters.URI = './strokes/thick.png';
						couche.style.parameters.stroke.parameters.width = 50.0;
						var quadMat = quadMatFromLayer(couche);
		
						for ( var i = 0; i < to_changeLine.length; i++ ) {
							var vertices = to_changeLine[i].geometry.vertices;
							for (var j = 0; j < vertices.length-1; j=j+2 ) {
								var lineGeom = createQuad(vertices[j], vertices[j+1]);
								var quad = new THREE.Mesh( lineGeom, quadMat);
								quad.userData = {couche : couche.id, quad : true };
								moveMesh(quad, couche.position.displacement.x, couche.position.displacement.y, couche.position.displacement.z);
								quad.rotation.set(couche.position.rotation.x,couche.position.rotation.y,couche.position.rotation.z);
								quad.scale.set(couche.position.scale.x,couche.position.scale.y,couche.position.scale.z);
								scene.add(quad);
							}
						}					
						elementVisible("uriStroke"+couche.id, true);
						elementVisible("widthStroke"+couche.id,true);
					}

					if (value === 'Invisible'){
						elementVisible("colorStroke"+couche.id, false);
					} else {
						elementVisible("colorStroke"+couche.id, true);
					}

					var lineMat = lineMatFromLayer(couche);


					for ( var i = 0; i < to_changeLine.length; i++ ) {
						to_changeLine[i].material = lineMat;
						to_changeLine[i].material.needsUpdate = true;
					}

				}

			}


			function changeStyleTrait(couche,value) {
				var to_changeQuad = [];
				var ancienne_value = couche.style.parameters.stroke.parameters.URI;
				

				if (ancienne_value !== value) {

					couche.style.parameters.stroke.parameters.URI = value;

					scene.traverse ( function( child ) {
						if ( child.userData.quad === true && child.userData.couche === couche.id ) {
							to_changeQuad.push( child );
						}
					} );
					//var texture = THREE.ImageUtils.loadTexture( value );
					var color = new THREE.Color().setHex(couche.style.parameters.stroke.color.replace("#", "0x"));
					mat = createMaterial(couche.style.parameters.stroke.parameters.width, value, couche.style.parameters.stroke.color);

					for ( var i = 0; i < to_changeQuad.length; i++ ) {
						to_changeQuad[i].material = mat;
						to_changeQuad[i].material.uniforms.color.value = [color.r, color.g, color.b];
						to_changeQuad[i].material.needsUpdate = true;
					}

				}

			}

			function changeEpaisseur(couche, value) {
				var to_changeQuad = [];
				var ancienne_value = couche.style.parameters.stroke.parameters.width;
				

				if (ancienne_value !== value) {

					couche.style.parameters.stroke.parameters.width = value;

					scene.traverse ( function( child ) {
						if ( child.userData.quad === true && child.userData.couche === couche.id ) {
							to_changeQuad.push( child );
						}
					} );


					for ( var i = 0; i < to_changeQuad.length; i++ ) {
						to_changeQuad[i].material.uniforms.thickness.value = value;   
						to_changeQuad[i].material.needsUpdate = true;
					}

				}


			}


			function changeSourceCouche (couche, URI){
				clearCouche(couche);
				couche.URI = URI;
				if (couche.style.parameters.fill.type === 'texture') {
					var mtl = URI.replace("obj", "mtl");
					couche.style.parameters.fill.parameters.URI = mtl;
				}
				loadCouche(couche);
			}

			

			function chargeData(){
				//var input = document.getElementById("file"+no);
				var container = document.getElementById("container");
				var input = document.createElement("input");
                input.type = "file";
                input.name = "file"+no;
				input.style = "display:none";
                container.appendChild(input);
				input.addEventListener("change",function(event){
					no++;
					var file = this.files[0];  
					var reader = new FileReader();
					reader.onload = function(progressEvent){
						var obj = this.result;
						addCouche("./models/"+file.name);
					};
					//reader.readAsText(file.name);
					reader.readAsDataURL(file);
			  	});
				input.click();
			}
			

			function changeName(couche, value){
				var ancienne_value = couche.name;
				if (ancienne_value !== value && !(gui.__folders[couche.name].__controllers[0].__input === document.activeElement))
				// && ( elem.type || elem.href ))
				{
					couche.name = value;
					//gui.__folders[value] = gui.__folders[ancienne_value];
					//gui.__folders[ancienne_value].__ul.hidden = true;
					delete gui.__folders[ancienne_value];
					document.getElementById("folder"+couche.id).remove();
					initGUICouche(couche);

					gui.__folders[value].open();

				}
			}

			function changeTypeSurface (couche, value) {
				var to_change = [];
				var ancienne_value = couche.style.parameters.fill.type;

				if (ancienne_value !== value) {
					couche.style.parameters.fill.type = value;

					scene.traverse ( function( child ) {
						if ( child instanceof THREE.Mesh && child.userData.couche === couche.id && child.userData.quad !== true ) {
							to_change.push( child );
						}
					} );

					couche.style.parameters.fill.parameters = {};


					if (value === 'image'){
						couche.style.parameters.fill.parameters.URI = "./textures/wall.jpg";
						elementVisible("imageFill"+couche.id,true);
					} else {
						elementVisible("imageFill"+couche.id,false);
					}
					if (couche.style.parameters.fill.type === 'texture') {
						changeSourceCouche(couche,couche.URI);
					} else if (ancienne_value === 'texture') {
						clearCouche(couche);
						loadCouche(couche);
					}
					var mat = matFromLayer(couche);
					//var mat =wallMaterial;


					for ( var i = 0; i < to_change.length; i++ ) {
						to_change[i].material = mat;
						to_change[i].material.needsUpdate = true;
					}

				}
			}


		function changeTexture (couche, value) {
			var to_change = [];
				var ancienne_value = couche.style.parameters.fill.parameters.URI;

				if (ancienne_value !== value) {
					couche.style.parameters.fill.parameters.URI = value;

					scene.traverse ( function( child ) {
						if ( child instanceof THREE.Mesh && child.userData.couche === couche.id && child.userData.quad !== true ) {
							to_change.push( child );
						}
					} );
				}
				var mat = matFromLayer(couche);

				for ( var i = 0; i < to_change.length; i++ ) {
						to_change[i].material = mat;
						to_change[i].material.needsUpdate = true;
					}

		}