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

					defaults = JSON.parse(getSourceSynch('./defaults.json'));

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
					//addText("hauteur initiale : "+params.h_ini, coucheToitFocus);


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
						//changeText("hauteur initiale : "+value.toString(),"hauteur", coucheToitFocus);
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
					params["imageFill"+couche.id] = "paper2.png";

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
					
					//paramètres position
					fPos.add(params, "scale"+couche.id, defaults.scale.min,defaults.scale.max,defaults.scale.step).name("Dimension").listen();
					fPos.add(params, "rotation"+couche.id, defaults.rotationX.min,defaults.rotationX.max,defaults.rotationX.step).name("Rotation axe X").listen();
					fPos.add(params, "x"+couche.id, defaults.positionX.min,defaults.positionX.max,defaults.positionX.step).name("x").listen();
					fPos.add(params, "y"+couche.id, defaults.positionY.min,defaults.positionY.max,defaults.positionY.step).name("y").listen();
					fPos.add(params, "z"+couche.id, defaults.positionZ.min,defaults.positionZ.max,defaults.positionZ.step).name("z").listen();


					//paramètres Fill
					folder.add( params, "name"+couche.id ).name("Nom couche").listen();
					folder.add( params, "typeFill"+couche.id, [ "uni", "texture", "image", "shader"] ).name("Type surface").listen();
					folder.addColor( params, "colorFill"+couche.id ).name("Couleur").listen();
					folder.add( params, "opaFill"+couche.id, 0,0.9999,0.1 ).name("Opacité").listen();

                    folder.add( params, "imageFill"+couche.id, eval(defaults.listTexturesFill) ).name("Image source").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "imageFill"+couche.id;



					//elementVisible("widthStroke"+couche.id,false);
                    elementVisible("imageFill"+couche.id,false);
                    elementVisible("repeatFill"+couche.id,false);


                    if (couche.style.parameters.fill.type === "image"){
						folder.add( params, "repeatFill"+couche.id, 0.01,1,0.01 ).name("Repeat").listen();
						gui.__folders[couche.name].__ul.lastChild.id = "repeatFill"+couche.id;
                        params["imageFill"+couche.id] = couche.style.parameters.fill.parameters.image;
						elementVisible("imageFill"+couche.id,true);
						params["repeatFill"+couche.id] = couche.style.parameters.fill.parameters.repeat;
						elementVisible("repeatFill"+couche.id,true);
					}

                    if (couche.style.parameters.fill.type === "shader"){

						var method = getMethod(couche.style.parameters.fill.parameters.shader);

						for (var j in method.parameters){
							var parameter = method.parameters[j];
							if (parameter.GUI.visible === true){
								params[parameter.name+"Fill"+couche.id] = couche.style.parameters.fill.parameters[parameter.name];
								if (parameter.type === 'float'){
									folder.add( params, parameter.name+"Fill"+couche.id, parameter.GUI.min,parameter.GUI.max,parameter.GUI.step ).name(parameter.name).listen();
								} else if (parameter.type === 'string'){
									folder.add( params, parameter.name+"Fill"+couche.id, eval(parameter.GUI.list) ).name(parameter.name).listen();
								}
								gui.__folders[couche.name].__ul.lastChild.id = parameter.name+"Fill"+couche.id;
								elementVisible(parameter.name+"Fill"+couche.id,true);
							}
						}


					}


					//paramètres Stroke
					folder.add( params, "typeStroke"+couche.id, [ "Continu", "Tirets", "Invisible", "Sketchy"] ).name("Type arêtes").listen();
				 	folder.addColor( params, "colorStroke"+couche.id ).name("Couleur arêtes").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "colorStroke"+couche.id;

					if (couche.style.parameters.stroke.type === "Invisible"){
						elementVisible("colorStroke"+couche.id,false);
					}

					if (couche.style.parameters.stroke.type === "Sketchy"){

						var method = getMethod(couche.style.parameters.stroke.parameters.shader);

						for (var j in method.parameters){
							var parameter = method.parameters[j];
							if (parameter.GUI.visible === true){
								params[parameter.name+"Stroke"+couche.id] = couche.style.parameters.stroke.parameters[parameter.name];
								if (parameter.type === 'float'){
									folder.add( params, parameter.name+"Stroke"+couche.id, parameter.GUI.min,parameter.GUI.max,parameter.GUI.step ).name(parameter.name).listen();
								} else if (parameter.type === 'string'){
									folder.add( params, parameter.name+"Stroke"+couche.id, eval(parameter.GUI.list) ).name(parameter.name).listen();
								}
								gui.__folders[couche.name].__ul.lastChild.id = parameter.name+"Stroke"+couche.id;
								elementVisible(parameter.name+"Stroke"+couche.id,true);
							}
						}


					}


			}


		function updateGUI() {
			var dirLight = getFirstLightByType('directional');
			for (var i in gui.__controllers) {
				gui.__controllers[i].updateDisplay();
			}
			for (var j in parse.couches){
				

				changeName(parse.couches[j], params["name"+parse.couches[j].id]);
				changeColor(parse.couches[j], params["colorFill"+parse.couches[j].id]);
				changeColorAretes(parse.couches[j], params["colorStroke"+parse.couches[j].id]);
				changeOpacite(parse.couches[j], params["opaFill"+parse.couches[j].id]);
				changeTypeAretes(parse.couches[j], params["typeStroke"+parse.couches[j].id] );
				if (parse.couches[j].style.parameters.stroke.type === "Sketchy"){
					for (var k in parse.couches[j].style.parameters.stroke.parameters){
						changeUniform (parse.couches[j], k, params[k+"Stroke"+parse.couches[j].id], "stroke" );
					}
				}
				changeTypeSurface (parse.couches[j], params["typeFill"+parse.couches[j].id] );
				if (parse.couches[j].style.parameters.fill.type === "image"){
					changeTexture (parse.couches[j], params["imageFill"+parse.couches[j].id] );
					changeRepeat (parse.couches[j], params["repeatFill"+parse.couches[j].id] );
				}

				if (parse.couches[j].style.parameters.fill.type === "shader"){
					var method = getMethod(parse.couches[j].style.parameters.fill.parameters.shader);
					if (dirLight !== undefined && method.uniforms["lightPosition"] !== undefined){
						changeLighting (parse.couches[j], params.pos_light);
					}
					for (var k in parse.couches[j].style.parameters.fill.parameters){
						changeUniform (parse.couches[j], k, params[k+"Fill"+parse.couches[j].id], "fill" );
					}

				}
				changeScale(parse.couches[j], params["scale"+parse.couches[j].id]);
				changeRotation(parse.couches[j], params["rotation"+parse.couches[j].id]);
				changePosition(parse.couches[j], params["x"+parse.couches[j].id], params["y"+parse.couches[j].id], params["z"+parse.couches[j].id]);

			}
			
			if (dirLight !== undefined){
				dirLight.position.x = params.pos_light;
			}
		}