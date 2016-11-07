
	function initMap() {
		
		/*$.when(	$.getJSON("countries.json") ).then(function(data){ 
			
			routes = new Map();
			
			init_d3();		
			
			routes.add_countries(data);
			
			// request animation frame
			var onFrame = window.requestAnimationFrame;

	
			onFrame(tick);
			
			document.addEventListener( 'mousemove', onDocumentMouseMove, false );
			window.addEventListener( 'resize', onWindowResize, false );
			
		});*/


        /*var loader = new THREE.JSONLoader();

            // load a resource
            loader.load(*/
                // resource URL
                var test_json = $.getJSON("2D/commune.json", function (data) { 
                // Function when resource is loaded

                    /*routes = new Map();
			
			    init_d3();		
			
			    routes.add_countries(data);*/
                 drawThreeGeo(data, 10, 'plane', { color: 'red'}) ;
                });
            //);
	}


/*function init_d3() {

			geoConfig = function() {
				
				this.mercator = d3.geo.equirectangular();
				this.path = d3.geo.path().projection(this.mercator);
				
				var translate = this.mercator.translate();
				translate[0] = 500;
				translate[1] = 0;
				
				this.mercator.translate(translate);
				this.mercator.scale(200);
			}
	
			this.geo = new geoConfig();
		}



    		function add_countries(data) {

				var countries = [];
				var i, j;
				
				// convert to threejs meshes
				for (i = 0 ; i < data.features.length ; i++) {
					var geoFeature = data.features[i];
					var properties = geoFeature.properties;
					var feature = this.geo.path(geoFeature);
					
					// we only need to convert it to a three.js path
					var mesh = transformSVGPathExposed(feature);
					
					// add to array
					for (j = 0 ; j < mesh.length ; j++) {
						  countries.push({"data": properties, "mesh": mesh[j]});
					}
				}
				
				// extrude paths and add color
				for (i = 0 ; i < countries.length ; i++) {
		
					// create material color based on average		
					var material = new THREE.MeshPhongMaterial({
						color: this.getCountryColor(countries[i].data), 
						opacity:0.5
					}); 
							
					// extrude mesh
					var shape3d = countries[i].mesh.extrude({
						amount: 1, 
						bevelEnabled: false
					});

					// create a mesh based on material and extruded shape
					var toAdd = new THREE.Mesh(shape3d, material);
					
					//set name of mesh
					toAdd.name = countries[i].data.name;
					
					// rotate and position the elements
					toAdd.rotation.x = Math.PI/2;
					/*toAdd.translateX(-2026000);
					toAdd.translateZ(50);
					toAdd.translateY(-6564000);
					moveMesh(toAdd,-106680, -234698,0)

					// add to scene
					this.scene.add(toAdd);
				}
		}


         function getCountryColor(data) {
			var multiplier = 0;
		
			for(i = 0; i < 3; i++) {
				multiplier += data.name.charCodeAt(i);
			}
			
			multiplier = (1.0/366)*multiplier;
			return multiplier*0xffffff;
		}*/