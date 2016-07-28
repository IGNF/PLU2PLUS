				//material avec ombrage (Lambert) ou sans (Basic)
				function choixMat(type) {
				
					if (type === 'Avec') {
						changeMat(arrayMur,new THREE.MeshLambertMaterial({color: params.color_mur_focus, side: THREE.DoubleSide, transparent :true, opacity : params.opacite_mur_focus, polygonOffset : true, polygonOffsetUnits : 10}));
					}
					else if (type === 'Sans') {
						changeMat(arrayMur,new THREE.MeshBasicMaterial({color: params.color_mur_focus, side: THREE.DoubleSide, transparent :true, opacity : params.opacite_mur_focus, polygonOffset : true, polygonOffsetUnits : 10}));
					}
					
				}
				
				
				//choix entre cadastre et orthophoto
				function choixFond(type) {
					var photo1 = scene.getObjectByName('photo1');
					var parcelle1 = scene.getObjectByName('parcelle1');
					var parcelle2 = scene.getObjectByName('parcelle2');
					if (type === 'Cadastre') {
						photo1.visible = false;
						parcelle1.visible = true;
						parcelle2.visible = true;
					}
					else if (type === 'Orthophoto') {
						parcelle1.visible = false;
						parcelle2.visible = false;
						photo1.visible = true;
					}	
					animate();	
				}
				
				//choix de la couleur d'une surface
				function choixCouleur (array, value) {
					for (i=0; i<array.length; i++){				
						array[i].material.color.setHex(value.replace("#", "0x"));   
					}
				}

				//choix de la couleur d'une surface
				function choixCouleurQuads (array, value) {
					var color = new THREE.Color().setHex(value.replace("#", "0x"));
					for (i=0; i<array.length; i++){				
						array[i].material.uniforms.color.value = [color.r, color.g, color.b];   
					}
				}
				
				
				//choix du type d'arêtes (continu, tirets, ou invisible)
				function choixAretes(array, arrayQuads, lineMat, type) {
				var couleur;
				var fEp = gui.__folders.Focus.__folders.Arêtes;
				
				
					if (array === arrayAretes){
						$(fEp.domElement).attr("hidden", true);
						couleur = params.color_aretes_focus;
						ok = true;
					} else {
						couleur = params.color_aretes_contexte;
						arrayQuads = [];
					}
				
					if (type === 'Continu') {
						lineMat = new THREE.LineBasicMaterial( { color: couleur, transparent: false } );
						for (i=0; i<array.length; i++){
							
							array[i].visible = true;
							array[i].material = lineMat;
							array.materialNeedsUpdate = true;
							//lineMat.needsUpdate = true;
						}
						for (i=0; i<arrayQuads.length; i++){
							arrayQuads[i].visible = false;
							arrayQuads.materialNeedsUpdate = true;
						}
					}
					else if (type === 'Tirets') {
						lineMat = new THREE.LineDashedMaterial( { color: couleur, dashSize: 0.7, gapSize: 1 } );
						for (i=0; i<array.length; i++){
							
							array[i].visible = true;
							array[i].material = lineMat;
							array.materialNeedsUpdate = true;
						}
						for (i=0; i<arrayQuads.length; i++){
							arrayQuads[i].visible = false;
							arrayQuads.materialNeedsUpdate = true;
						}
					}
					else if (type === 'Invisible') {
						lineMat.visible = false;
						for (i=0; i<array.length; i++){
						
							array[i].visible = false;
							array.materialNeedsUpdate = true;
						}
						for (i=0; i<arrayQuads.length; i++){
							arrayQuads[i].visible = false;
							arrayQuads.materialNeedsUpdate = true;
						}
					}
					else if (type === 'Sketchy') {
						$(fEp.domElement).attr("hidden", false);
						fEp.open();
						lineMat = createMaterial(params.epaisseur_aretes_focus, params.type_trait, params.color_aretes_focus);
						for (i=0; i<arrayQuads.length; i++){		
							arrayQuads[i].visible = true;
							/*if (arrayQuads[i].userData.toit === true){
								lineMat2 = createMaterial(params.epaisseur_aretes_focus);
								lineMat2.polygonOffset = true;
								lineMat2.polygonOffsetFactor = 0.0;
								lineMat2.polygonOffsetUnits = -151.0;
								lineMat2.needsUpdate = true;
								arrayQuads[i].material = lineMat2;
								arrayQuads.materialNeedsUpdate = true;
							} else {*/
								arrayQuads[i].material = lineMat;
								arrayQuads.materialNeedsUpdate = true;
							//}
						}
						for (i=0; i<array.length; i++){
							
							array[i].visible = false;
							array.materialNeedsUpdate = true;
						}
					}
					
					return lineMat;
					
				}
				
				
				
				//choix entre bati3D et BDtopo
				function choixContexte(type, arrayBatiMur, arrayBatiToit,arrayAretesBati, arrayBDMur, arrayBDToit, arrayAretesBD,arrayAretesContexte, lineMat) {
					
					if (type === 'BDTopo') {
						arrayAretesContexte = arrayAretesBD;
						//choixAretes(arrayAretesContexte, arrayQuads, lineMat, params.type_aretes_contexte);
						for (i=0; i<arrayAretesBati.length; i++) {
							arrayAretesBati[i].visible=false;
						}
						for (i=0; i<arrayBatiMur.length; i++) {
							arrayBatiMur[i].visible = false;
						}
						for (i=0; i<arrayBatiToit.length; i++) {
							arrayBatiToit[i].visible = false;
						}
						
						for (j=0; j<arrayBDMur.length; j++) {
							arrayBDMur[j].visible = true;
						}	
						for (j=0; j<arrayBDToit.length; j++) {
							arrayBDToit[j].visible = true;
						}
						for (j=0; j<arrayAretesBD.length; j++) {
							arrayAretesBD[j].visible = true;
						}	


					}
					else if (type === 'Bati3D') {
						arrayAretesContexte = arrayAretesBati;
						
						for (j=0; j<arrayBDMur.length; j++) {
							arrayBDMur[j].visible = false;
						}	
						for (j=0; j<arrayBDToit.length; j++) {
							arrayBDToit[j].visible = false;
						}
						for (j=0; j<arrayAretesBD.length; j++) {
							arrayAretesBD[j].visible = false;
						}						
						for (i=0; i<arrayAretesBati.length; i++) {
							arrayAretesBati[i].visible=true;
						}
						for (i=0; i<arrayBatiMur.length; i++) {
							arrayBatiMur[i].visible = true;
						}
						for (i=0; i<arrayBatiToit.length; i++) {
							arrayBatiToit[i].visible = true;
						}	
					}

					choixAretes(arrayAretesContexte, arrayQuads, lineMat, params.type_aretes_contexte);

					return arrayAretesContexte;	
				}
				
				//choix entre un contexte discret ou photoréaliste (texturé)
				function choixStyleContexte(style, BDVisible, fContexte, matMurContexte, matToitContexte, lineMatContexte) {
					clearContexte();
					if (style === 'Discret') {
						//BDTopo
						loadObj( './models/outAnouk/BDTopoMurs.obj', arrayAretesContexteBD, arrayBDMur, BDVisible);
						loadObj( './models/outAnouk/BDTopoToit.obj', arrayAretesContexteBD, arrayBDToit, BDVisible);
						//Bati3D
						//loadObj( './models/outAnouk/Bati3DMur.obj', arrayAretesContexteBati, arrayBatiMur, !BDVisible);
						//loadObj( './models/outAnouk/Bati3DToit.obj', arrayAretesContexteBati, arrayBatiToit, !BDVisible);
						$(fContexte.domElement).attr("hidden", false);
					} else if (style === 'Typique') {

						params.color_mur_focus = '#270906';
						params.opacite_mur_focus = 1.0;
						
						params.color_toit_focus = '#6C3527';						
						params.opacite_toit_focus = 1.0;

						params.color_aretes_focus = '#000000';
						//params.type_aretes_focus = 'Continu';
						params.type_material = 'Avec';

						var matMur = new THREE.MeshLambertMaterial({color: params.color_mur_focus, side: THREE.DoubleSide, transparent :(params.opacite_mur_focus<1), opacity : params.opacite_mur_focus, polygonOffset : true, polygonOffsetUnits : 10});
						var matToit = new THREE.MeshBasicMaterial({color: params.color_toit_focus, side: THREE.DoubleSide, transparent :(params.opacite_toit_focus<1), opacity : params.opacite_toit_focus, polygonOffset : true, polygonOffsetUnits : 10})
						var lineMat = new THREE.LineBasicMaterial( { color: params.color_aretes_focus, transparent: false } );
						//BDTopo
						loadObj( './models/outAnouk/BDTopoMurs.obj', arrayAretesContexteBD, arrayBDMur, BDVisible);
						loadObj( './models/outAnouk/BDTopoToit.obj', arrayAretesContexteBD, arrayBDToit, BDVisible);
						//Bati3D
						loadObj( './models/outAnouk/Bati3DMur.obj', arrayAretesContexteBati, arrayBatiMur, !BDVisible);
						loadObj( './models/outAnouk/Bati3DToit.obj', arrayAretesContexteBati, arrayBatiToit, !BDVisible);
						$(fContexte.domElement).attr("hidden", true);
					} else if (style === 'Photoréaliste'){
						BDVisible = (params.type_contexte === 'BDTopo');
						loadObjMtl('./models/outAnouk/Bati3DTexture.mtl','./models/outAnouk/Bati3DTexture.obj', 0,0,2, 'textures', true);
						$(fContexte.domElement).attr("hidden", true);
					}
				return BDVisible;
				}
				
				//choix entre un focus discret, typique ou semi-réaliste (texturé)
				function choixStyleFocus(style, fFocus, fTexture, roofMaterial, wallMaterial, lineMatFocus) {
					if (style === 'Discret') {
						
						params.color_mur_focus = '#ffffff';
						params.opacite_mur_focus = 0.7;
						
						params.color_toit_focus = '#000000';						
						params.opacite_toit_focus = 0.7;
		
						params.color_aretes_focus = '#666666';
						params.type_aretes_focus = 'Tirets';
						params.type_material = 'Avec';

						changeMat(arrayMur, new THREE.MeshLambertMaterial({color: params.color_mur_focus, side: THREE.DoubleSide, transparent :(params.opacite_mur_focus<1), opacity : params.opacite_mur_focus, polygonOffset : true, polygonOffsetUnits : 10}));
						changeMat(arrayToit,new THREE.MeshBasicMaterial({color: params.color_toit_focus, side: THREE.DoubleSide, transparent :(params.opacite_toit_focus<1), opacity : params.opacite_toit_focus, polygonOffset : true, polygonOffsetUnits : 10}));
						$(fTexture.domElement).attr("hidden", true);
						$(fFocus.domElement).attr("hidden", false);

					} else if (style === 'Typique'){
						params.color_mur_focus = '#270906';
						params.opacite_mur_focus = 1.0;
						
						params.color_toit_focus = '#6C3527';						
						params.opacite_toit_focus = 1.0;

						params.color_aretes_focus = '#000000';
						params.type_aretes_focus = 'Continu';
						params.type_material = 'Avec';

						changeMat(arrayMur,new THREE.MeshLambertMaterial({color: params.color_mur_focus, side: THREE.DoubleSide, transparent :(params.opacite_mur_focus<1), opacity : params.opacite_mur_focus, polygonOffset : true, polygonOffsetUnits : 10}) );
						changeMat(arrayToit, new THREE.MeshBasicMaterial({color: params.color_toit_focus, side: THREE.DoubleSide, transparent :(params.opacite_toit_focus<1), opacity : params.opacite_toit_focus, polygonOffset : true, polygonOffsetUnits : 10}));
						
						$(fTexture.domElement).attr("hidden", true);
						$(fFocus.domElement).attr("hidden", false);

					} else if (style === 'Semi'){

						changeMat(arrayMur, wallMaterial);
						changeMat(arrayToit, roofMaterial);
						
						params.type_aretes_focus = 'Invisible';
						
						$(fTexture.domElement).attr("hidden", false);
						$(fFocus.domElement).attr("hidden", true);
						fTexture.open();
						
					} else if (style === 'Sketchy'){

						params.color_mur_focus = '#a45f58';
						params.opacite_mur_focus = 1.0;
						
						params.color_toit_focus = '#ffb48c';						
						params.opacite_toit_focus = 1.0;
		
						params.color_aretes_focus = '#000000';
						params.type_aretes_focus = 'Sketchy';
						params.epaisseur_aretes_focus = 75.0;
						params.type_material = 'Sans';
						params.epaisseur_aretes_focus = 50.0;
						params.type_trait = 'thick';

						changeMat(arrayMur, new THREE.MeshBasicMaterial({color: params.color_mur_focus, side: THREE.DoubleSide, transparent :(params.opacite_mur_focus<1), opacity : params.opacite_mur_focus, polygonOffset : true, polygonOffsetUnits : 10}));
						changeMat(arrayToit,new THREE.MeshBasicMaterial({color: params.color_toit_focus, side: THREE.DoubleSide, transparent :(params.opacite_toit_focus<1), opacity : params.opacite_toit_focus, polygonOffset : true, polygonOffsetUnits : 10}));
						$(fTexture.domElement).attr("hidden", true);
						$(fFocus.domElement).attr("hidden", false);
						
					}

					

					choixAretes (arrayAretes, arrayQuads, lineMatFocus, params.type_aretes_focus);
					
				}

			function epaisseurAretes(value, arrayQuads)	{
				for (i=0;i<arrayQuads.length;i++){
					arrayQuads[i].material.uniforms.thickness.value = value;
					arrayQuads.materialNeedsUpdate = true;
				}
			}
				
				
			//choix de la texture du focus semiréaliste	
			function choixTexture(value, array){
				
				var textureMaterial = new THREE.MeshBasicMaterial( {
					map: null,
					color: 0xffffff,
					shading: THREE.SmoothShading
				} );
				
				
				var textureLoader = new THREE.TextureLoader();
				textureLoader.load( "./textures/"+value+".jpg", function( map ) {
					map.wrapS = THREE.RepeatWrapping;
					map.wrapT = THREE.RepeatWrapping;
					map.anisotropy = 4;
					map.repeat.set( 0.1, 0.1 );
					textureMaterial.side = THREE.DoubleSide;
					textureMaterial.map = map;
					textureMaterial.needsUpdate = true;
				} );
				
	
				for (i=0; i<array.length; i++){
					array[i].material = textureMaterial;
					array.materialNeedsUpdate = true;
				}
			}

			function choixTrait(value, arrayQuads) {
				mat = createMaterial(params.epaisseur_aretes_focus, value, params.color_aretes_focus);
				changeMat(arrayQuads,mat);

			}

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

			function addArbre(){
				if (nbArbres < 50) {
					loadArbre('./models/tree.mtl','./models/tree.obj', new THREE.Vector3(5*nbArbres,0,-15));
				} else {
					loadArbre('./models/tree.mtl','./models/tree.obj', new THREE.Vector3(245-5*nbArbres,0,-15));
				}
				nbArbres++;
			}

			function supprArbre(){
				var arbres = [];

				scene.traverse ( function( child ) {
					if ( child instanceof THREE.Mesh && child.userData.arbre === true ) {
						arbres.push( child );
					 }
				} );

				if (nbArbres > 0) {
					scene.remove( arbres[(arbres.length)-1] );
					objects.pop();
					positions.pop();
					nbArbres--;
				}
				
				
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