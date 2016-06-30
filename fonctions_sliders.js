				//material avec ombrage (Lambert) ou sans (Basic)
				function choixMat(type) {
				
					if (type === 'Avec') {
						
						for (i=0; i<arrayMur.length; i++){
							arrayMur[i].material = new THREE.MeshLambertMaterial({color: params.color_mur_focus, side: THREE.DoubleSide, transparent :true, opacity : params.opacite_mur_focus});
							arrayMur.materialNeedsUpdate = true;
						}
					}
					else if (type === 'Sans') {
					
						for (i=0; i<arrayMur.length; i++){
							arrayMur[i].material = new THREE.MeshBasicMaterial({color: params.color_mur_focus, side: THREE.DoubleSide, transparent :true, opacity : params.opacite_mur_focus});
							arrayMur.materialNeedsUpdate = true;
						}
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
				
					if (array === arrayAretes){
						couleur = params.color_aretes_focus;
					} else {
						couleur = params.color_aretes_contexte;
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
						lineMat = createMaterial(params.epaisseur_aretes_focus);
						for (i=0; i<arrayQuads.length; i++){		
							arrayQuads[i].visible = true;
							arrayQuads[i].material = lineMat;
							arrayQuads.materialNeedsUpdate = true;
						}
						for (i=0; i<array.length; i++){
							
							array[i].visible = false;
							array.materialNeedsUpdate = true;
						}
					}
					
					return lineMat;
					
				}
				
				
				
				//choix entre bati3D et BDtopo
				function choixContexte(type, arrayBatiMur, arrayBatiToit,arrayAretesBati, arrayBDMur, arrayBDToit, arrayAretesBD, lineMat) {
					
					if (type === 'BDTopo') {
						arrayAretesContexte = arrayAretesBD;
						choixAretes(arrayAretesContexte,lineMat, params.type_aretes_contexte);
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
						choixAretes(arrayAretesContexte, lineMat, params.type_aretes_contexte);
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
				}
				
				//choix entre un contexte discret ou photoréaliste (texturé)
				function choixStyleContexte(style, BDVisible, fContexte, matMurContexte, matToitContexte, lineMatContexte) {
					clearContexte();
					if (style === 'Discret') {
						//BDTopo
						loadObj( './models/outAnouk/BDTopoMurs.obj', matMurContexte, lineMatContexte, arrayAretesContexteBD, arrayBDMur, 0, BDVisible);
						loadObj( './models/outAnouk/BDTopoToit.obj', matToitContexte, lineMatContexte, arrayAretesContexteBD, arrayBDToit, 0, BDVisible);
						//Bati3D
						loadObj( './models/outAnouk/Bati3DMur.obj', matMurContexte, lineMatContexte, arrayAretesContexteBati, arrayBatiMur, 1, !BDVisible);
						loadObj( './models/outAnouk/Bati3DToit.obj', matToitContexte, lineMatContexte, arrayAretesContexteBati, arrayBatiToit, 1, !BDVisible);
						$(fContexte.domElement).attr("hidden", false);
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
						
						for (i=0; i<arrayMur.length; i++){
							arrayMur[i].material = new THREE.MeshLambertMaterial({color: params.color_mur_focus, side: THREE.DoubleSide, transparent :(params.opacite_mur_focus<1), opacity : params.opacite_mur_focus});
							arrayMur.materialNeedsUpdate = true;
						}
						for (i=0; i<arrayToit.length; i++){
							arrayToit[i].material = new THREE.MeshLambertMaterial({color: params.color_toit_focus, side: THREE.DoubleSide, transparent :(params.opacite_toit_focus<1), opacity : params.opacite_toit_focus});
							arrayToit.materialNeedsUpdate = true;
						}
						$(fTexture.domElement).attr("hidden", true);
						$(fFocus.domElement).attr("hidden", false);

					} else if (style === 'Typique'){
						params.color_mur_focus = '#270906';
						params.opacite_mur_focus = 1.0;
						
						params.color_toit_focus = '#6C3527';						
						params.opacite_toit_focus = 1.0;

						params.color_aretes_focus = '#000000';
						params.type_aretes_focus = 'Continu';
						
						for (i=0; i<arrayMur.length; i++){
							arrayMur[i].material = new THREE.MeshLambertMaterial({color: params.color_mur_focus, side: THREE.DoubleSide, transparent :(params.opacite_mur_focus<1), opacity : params.opacite_mur_focus});
							arrayMur.materialNeedsUpdate = true;
						}
						for (i=0; i<arrayToit.length; i++){
							arrayToit[i].material = new THREE.MeshLambertMaterial({color: params.color_toit_focus, side: THREE.DoubleSide, transparent :(params.opacite_toit_focus<1), opacity : params.opacite_toit_focus});
							arrayToit.materialNeedsUpdate = true;
						}
						
						$(fTexture.domElement).attr("hidden", true);
						$(fFocus.domElement).attr("hidden", false);

					} else if (style === 'Semi'){
						for (i=0; i<arrayToit.length; i++){
							arrayToit[i].material = roofMaterial;
							arrayToit.materialNeedsUpdate = true;
						}
						for (i=0; i<arrayMur.length; i++){
							arrayMur[i].material = wallMaterial;
							arrayMur.materialNeedsUpdate = true;
						}
						
						params.type_aretes_focus = 'Invisible';
						
						$(fTexture.domElement).attr("hidden", false);
						$(fFocus.domElement).attr("hidden", true);
						
					}
					

					choixAretes (arrayAretes, lineMatFocus, params.type_aretes_focus);
					
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
				
			//sauvegarde de la configuration des paramètres actuels dans un fichier
			function saveJSON(){
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
			
			