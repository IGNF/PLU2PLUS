function loadAll(){
			
			//chargement du JSON
			var input = document.getElementById("file");
			input.addEventListener("change",function(){
				var file = this.files[0];  
				var reader = new FileReader();
				reader.onload = function(progressEvent){

					input.style = 'display:none;';	
					var json = this.result;
					parse = JSON.parse(json);

                    init();

					newID = parse.couches.length+1;

					gui = new dat.GUI({ autoplace: false, width: 400});
					
					//dossiers
					var fCapture = gui.addFolder('Captures d\'écran');
					var fCam = gui.addFolder('Caméra et ombrage');
					var fCouche = gui.addFolder('Gestion des couches');

					var shadowLight = getFirstElementFromUserData('typelight','directional');
					var dirLight = getFirstLightByType('directional');

					var coucheFond = getCoucheByName("Fond");
					var coucheToitFocus = getCoucheByName("Toits focus");
					var coucheMurFocus = getCoucheByName("Murs focus");
					
					//paramètres dat.gui
					params = {
						pos_camera : function() {resetCam(camera)},
                        toggle_shadow : true,
						save_config :  function() {saveConfig()},
                        save_screenshot : function() {saveScreenshot(zip)},
						nb_images : nbImage,
						download : function(){downloadAll(zip)},
						empty_zip : function() {emptyZip(zip)},
						type_fond : coucheFond.URI,
						h_ini : parseInt(coucheMurFocus.URI.substring(19,20)),
						s_pente : parseFloat(coucheMurFocus.URI.substring(29,32)),
						add_couche : function () {chargeData()},
						suppr_couche : '',
						copy_couche : ''
					};


					//gui.remember(params);

					var pos_cam = fCam.add(params, 'pos_camera').name('Réinitialiser la caméra').listen();

                    var save_screenshot = fCapture.add(params, 'save_screenshot').name('Capture d\'écran').listen();
					var nb_images = fCapture.add(params, 'nb_images').name('Nombre d\'images').listen();
                    var download = fCapture.add(params, 'download').name('Télécharger les images').listen();	
					var empty_zip = fCapture.add(params, 'empty_zip').name('Supprimer les images enregistrées').listen();
					var save_config = gui.add(params, 'save_config').name('Sauvegarder la configuration').listen();
					var type_fond = gui.add(params, 'type_fond', [ "./models/Parcelle.obj", "./models/Ortho.obj"]).name('Fond').listen();
					var h_ini = gui.add(params, 'h_ini', 0,6).step(2).name("Hauteur initiale").listen();
					var s_pente = gui.add(params, 's_pente', 0,3.0).step(0.5).name("Pente").listen();
					var add_couche = fCouche.add(params, 'add_couche').name("Nouvelle couche").listen();
					var suppr_couche = fCouche.add(params, 'suppr_couche').name("Supprimer couche").listen();
					var copy_couche = fCouche.add(params, 'copy_couche').name("Dupliquer couche").listen();


					
					type_fond.onChange(function(value) { changeSourceCouche(coucheFond, value); });
					h_ini.onFinishChange(function(value) {
						changeSourceCouche(coucheMurFocus, "./models/Wall_Hini_"+value.toString()+".0_Slope_"+params.s_pente.toPrecision(2).toString().substring(0, 3)+".obj");
						changeSourceCouche(coucheToitFocus, "./models/Roof_Hini_"+value.toString()+".0_Slope_"+params.s_pente.toPrecision(2).toString().substring(0, 3)+".obj")
					});
					s_pente.onFinishChange(function(value) {
						changeSourceCouche(coucheMurFocus, "./models/Wall_Hini_"+params.h_ini.toString()+".0_Slope_"+value.toPrecision(2).toString().substring(0, 3)+".obj");
						changeSourceCouche(coucheToitFocus, "./models/Roof_Hini_"+params.h_ini.toString()+".0_Slope_"+value.toPrecision(2).toString().substring(0, 3)+".obj")
					});
					suppr_couche.onFinishChange(function(value) {
						clearCouche(getCoucheByName(value));
						clearParse(getCoucheByName(value));
					});
					copy_couche.onFinishChange(function(value) {
						copyCouche(getCoucheByName(value));
					});

                    save_screenshot.onFinishChange(function(value) {params.nb_images = nbImage+1;});
					empty_zip.onFinishChange(function(value) {params.nb_images = 0;});

					if (dirLight !== undefined){
						params.pos_light = dirLight.position.x;
						var toggle_shadow = fCam.add(params, 'toggle_shadow').name('Activer l\'ombre projetée');
						var pos_light = fCam.add(params, 'pos_light',-800,800,1).name('x light').listen();
						pos_light.onChange(function(value) {positionLight(value);});
						toggle_shadow.onChange(function(value) {shadowLight.castShadow = !shadowLight.castShadow;});
					}


					loadLayers();
					loadParams();
					

					animate();



				};
				reader.readAsText(file);
			  });
			input.click();
			
				
		}

        function initGUICouche (couche){
				var folder = gui.addFolder(couche.name);
				gui.__folders[couche.name].__ul.id = "folder"+couche.id;

					params["name"+couche.id] = couche.name;
					params["typeFill"+couche.id] = couche.style.parameters.fill.type;
					params["colorFill"+couche.id] = couche.style.parameters.fill.color;
					params["opaFill"+couche.id] = couche.style.parameters.fill.opacite;
					params["repeatFill"+couche.id] = 0.1;
					params["diffuseFill"+couche.id] = 0.7;
					params["imageFill"+couche.id] = "./textures/paper2.png";

					params["colorStroke"+couche.id] = couche.style.parameters.stroke.color;
					params["typeStroke"+couche.id] = couche.style.parameters.stroke.type;
					params["uriStroke"+couche.id] = "thick";
					params["widthStroke"+couche.id] = 50.0;

					params["scale"+couche.id] = couche.position.scale.x;
					params["rotation"+couche.id] = couche.position.rotation.x;
					params["x"+couche.id] = couche.position.displacement.x;
					params["y"+couche.id] = couche.position.displacement.y;
					params["z"+couche.id] = couche.position.displacement.z;

					var fPos = folder.addFolder("Position");


					folder.add( params, "name"+couche.id ).name("Nom couche").listen();
					folder.add( params, "typeFill"+couche.id, [ "uni", "texture", "image", "shader"] ).name("Type surface").listen();
					folder.addColor( params, "colorFill"+couche.id ).name("Couleur").listen();
					folder.add( params, "opaFill"+couche.id, 0,0.9999,0.1 ).name("Opacité").listen();
					folder.add( params, "repeatFill"+couche.id, 0.01,1,0.01 ).name("Repeat").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "repeatFill"+couche.id;
					folder.add( params, "diffuseFill"+couche.id, 0.01,1,0.01 ).name("Diffuse").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "diffuseFill"+couche.id;
                    folder.add( params, "imageFill"+couche.id, [ "./textures/wall.jpg", "./textures/roof.jpg", "./textures/stone-wall.jpg", "./textures/wall_green.jpg", "./textures/hatch.jpg", , "./textures/hatch_3.jpg"] ).name("Image source").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "imageFill"+couche.id;
					folder.add( params, "typeStroke"+couche.id, [ "Continu", "Tirets", "Invisible", "Sketchy"] ).name("Type arêtes").listen();
				 	folder.addColor( params, "colorStroke"+couche.id ).name("Couleur arêtes").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "colorStroke"+couche.id;
					folder.add( params, "uriStroke"+couche.id, [ "irregulier", "two", "thick", "brush", "tirets"] ).name("Style trait").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "uriStroke"+couche.id;
					folder.add( params, "widthStroke"+couche.id, 10, 100, 1 ).name("Epaisseur").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "widthStroke"+couche.id;
					elementVisible("uriStroke"+couche.id,false);
					elementVisible("widthStroke"+couche.id,false);
                    elementVisible("imageFill"+couche.id,false);
                    elementVisible("repeatFill"+couche.id,false);
                    elementVisible("diffuseFill"+couche.id,false);
					if (couche.style.parameters.stroke.type === "Sketchy"){
						params["uriStroke"+couche.id] = couche.style.parameters.stroke.parameters.URI;
						params["widthStroke"+couche.id] = couche.style.parameters.stroke.parameters.width;
						elementVisible("widthStroke"+couche.id,true);
						elementVisible("uriStroke"+couche.id,true);
					}
					if (couche.style.parameters.stroke.type === "Invisible"){
						elementVisible("colorStroke"+couche.id,false);
					}
                    if (couche.style.parameters.fill.type === "image"){
                        params["imageFill"+couche.id] = couche.style.parameters.fill.parameters.URI;
						elementVisible("imageFill"+couche.id,true);
						params["repeatFill"+couche.id] = couche.style.parameters.fill.parameters.repeat;
						elementVisible("repeatFill"+couche.id,true);
					}
                    if (couche.style.parameters.fill.type === "shader"){
                        params["repeatFill"+couche.id] = couche.style.parameters.fill.parameters.repeat;
						elementVisible("repeatFill"+couche.id,true);
                        params["diffuseFill"+couche.id] = couche.style.parameters.fill.parameters.diffuse;
						elementVisible("diffuseFill"+couche.id,true);
					}

					fPos.add(params, "scale"+couche.id, 0,1,0.01).name("Dimension").listen();
					fPos.add(params, "rotation"+couche.id, 0,2*Math.PI,0.01).name("Rotation axe X").listen();
					fPos.add(params, "x"+couche.id, -100,100,0.01).name("x").listen();
					fPos.add(params, "y"+couche.id, -100,100,0.01).name("y").listen();
					fPos.add(params, "z"+couche.id, -20,20,0.01).name("z").listen();

			}


		function updateGUI() {
			var dirLight = getFirstLightByType('directional');
			for (var i in gui.__controllers) {
				gui.__controllers[i].updateDisplay();
			}
			for (var j = 0; j < parse.couches.length; j++){
				changeName(parse.couches[j], params["name"+parse.couches[j].id]);
				changeColor(parse.couches[j], params["colorFill"+parse.couches[j].id]);
				changeColorAretes(parse.couches[j], params["colorStroke"+parse.couches[j].id]);
				changeOpacite(parse.couches[j], params["opaFill"+parse.couches[j].id]);
				changeTypeAretes(parse.couches[j], params["typeStroke"+parse.couches[j].id] );
				if (parse.couches[j].style.parameters.stroke.type === "Sketchy"){
					changeStyleTrait(parse.couches[j], params["uriStroke"+parse.couches[j].id] );
					changeEpaisseur(parse.couches[j], params["widthStroke"+parse.couches[j].id]);
				}
				changeTypeSurface (parse.couches[j], params["typeFill"+parse.couches[j].id] );
				if (parse.couches[j].style.parameters.fill.type === "image"){
					changeTexture (parse.couches[j], params["imageFill"+parse.couches[j].id] );
					changeRepeat (parse.couches[j], params["repeatFill"+parse.couches[j].id] );
				}
				if (parse.couches[j].style.parameters.fill.type === "shader"){
					if (dirLight !== undefined){
						changeLighting (parse.couches[j], params.pos_light);
					}
					changeRepeat (parse.couches[j], params["repeatFill"+parse.couches[j].id] );
					changeDiffuse (parse.couches[j], params["diffuseFill"+parse.couches[j].id] );
				}
				changeScale(parse.couches[j], params["scale"+parse.couches[j].id]);
				changeRotation(parse.couches[j], params["rotation"+parse.couches[j].id]);
				changePosition(parse.couches[j], params["x"+parse.couches[j].id], params["y"+parse.couches[j].id], params["z"+parse.couches[j].id]);

			}
			
			if (dirLight !== undefined){
				dirLight.position.x = params.pos_light;
			}
		}