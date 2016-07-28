function loadAll(){
			
			//chargement du JSON
			var input = document.getElementById("file");
			input.addEventListener("change",function(){
				var file = this.files[0];  
				var reader = new FileReader();
				reader.onload = function(progressEvent){

					input.style = 'display:none;';	
					var json = this.result;

					init();

					parse = JSON.parse(json);
					newID = parse.couches.length+1;
			
					//gui = new dat.GUI({ autoplace: false, width: 400, load : JSON.parse(json)});
					gui = new dat.GUI({ autoplace: false, width: 400});
					
					//dossiers
					/*var fFocus = gui.addFolder('Focus'),
					fTexture = gui.addFolder('Focus texture'),
					fContexte = gui.addFolder('Contexte');
					
					$(fTexture.domElement).attr("hidden", true);*/

					var coucheFond = getCoucheByName("Fond");
					var coucheToitFocus = getCoucheByName("Toits focus");
					var coucheMurFocus = getCoucheByName("Murs focus");
					
					//paramètres dat.gui
					params = {
						/*opacite_mur_focus: 1.0,

						texture_mur : 'wall',

						arbres : ''*/
						pos_camera : function() {resetCam(camera)},
						save_config :  function() {saveConfig()},
						type_fond : coucheFond.URI,
						h_ini : parseInt(coucheMurFocus.URI.substring(19,20)),
						s_pente : parseFloat(coucheMurFocus.URI.substring(29,32)),
						add_couche : function () {chargeData()},
						suppr_couche : ''
						//function() {supprCouche()}

					};
					//params.setAttribute("color", "#222222");
					//params.color ="#222222" ;
					gui.remember(params);

					var pos_cam = gui.add(params, 'pos_camera').name('Réinitialiser la caméra').listen();
					var save_config = gui.add(params, 'save_config').name('Sauvegarder la configuration').listen();
					var type_fond = gui.add(params, 'type_fond', [ "./models/Parcelle.obj", "./models/Ortho.obj"]).name('Fond').listen();
					var h_ini = gui.add(params, 'h_ini', 0,6).step(2).name("Hauteur initiale").listen();
					var s_pente = gui.add(params, 's_pente', 0,3.0).step(0.5).name("Pente").listen();
					var add_couche = gui.add(params, 'add_couche').name("Nouvelle couche").listen();
					var suppr_couche = gui.add(params, 'suppr_couche').name("Supprimer couche").listen();


					
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
					//params["uriSource"+couche.id] = couche.URI;
					//params["uriSource"+couche.id] = function() {chargeData()};
					params["name"+couche.id] = couche.name;
					params["typeFill"+couche.id] = couche.style.parameters.fill.type;
					params["colorFill"+couche.id] = couche.style.parameters.fill.color;
					params["opaFill"+couche.id] = couche.style.parameters.fill.opacite;
					params["imageFill"+couche.id] = "./textures/wall.jpg";
					params["colorStroke"+couche.id] = couche.style.parameters.stroke.color;
					params["typeStroke"+couche.id] = couche.style.parameters.stroke.type;
					params["uriStroke"+couche.id] = "./strokes/thick.png";
					params["widthStroke"+couche.id] = 50.0;


					//folder.add( params, "uriSource"+couche.id ).name("Source de données").listen();
					//gui.__folders[couche.name].__ul.lastChild.id = "uriSource"+couche.id;
					folder.add( params, "name"+couche.id ).name("Nom couche").listen();
					folder.add( params, "typeFill"+couche.id, [ "uni", "texture", "image"] ).name("Type surface").listen();
					folder.addColor( params, "colorFill"+couche.id ).name("Couleur").listen();
					folder.add( params, "opaFill"+couche.id, 0,0.9999,0.1 ).name("Opacité").listen();
                    folder.add( params, "imageFill"+couche.id, [ "./textures/wall.jpg", "./textures/roof.jpg", "./textures/stone-wall.jpg", "./textures/wall_green.jpg"] ).name("Image source").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "imageFill"+couche.id;
					folder.add( params, "typeStroke"+couche.id, [ "Continu", "Tirets", "Invisible", "Sketchy"] ).name("Type arêtes").listen();
				 	folder.addColor( params, "colorStroke"+couche.id ).name("Couleur arêtes").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "colorStroke"+couche.id;
					folder.add( params, "uriStroke"+couche.id, [ "./strokes/wavy.png", "./strokes/two.png", "./strokes/thick.png", "./strokes/brush.png", "./strokes/tirets.png", "./strokes/tirets2.png"] ).name("Style trait").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "uriStroke"+couche.id;
					folder.add( params, "widthStroke"+couche.id, 10, 100, 1 ).name("Epaisseur").listen();
					gui.__folders[couche.name].__ul.lastChild.id = "widthStroke"+couche.id;
					elementVisible("uriStroke"+couche.id,false);
					elementVisible("widthStroke"+couche.id,false);
                    elementVisible("imageFill"+couche.id,false);
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
					}

			}