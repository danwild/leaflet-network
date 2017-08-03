
var LeafletNetwork = {

	init: function(map, data){

		// the target/currently inspected site ID, and mode of inspection
		var targetId = null;
		var visMode = 'ANY';

		// TODO
		// scale matrix values to a consistent range, this needs work
		linearScale = d3.scale.linear().domain([0,100]).range([1,5]);

		// initialize the SVG layer
		// TODO refactor to leaflet v1
		var svgLayer = L.svg();
		svgLayer.addTo(map);

		// we simply pick up the SVG from the map object
		var svg = d3.select("#map").select("svg");

		// leaflet svg has pointer events disabled by default..
		svg.attr("pointer-events", "all");
		var group1 = svg.append("g");
		var group2 = group1.append("g");

		// add a leaflet position to each site
		_.each(data, function(site){
			site.properties.LatLng = new L.LatLng(site.properties.lat, site.properties.lon);
		});

		// create site circles
		var feature = group1.selectAll("circle")
			.data(_.map(data, function(d){ return d; }))
			.attr("class", "site")
			.enter().append("circle")
			.style("opacity", .5)
			.style("cursor", "pointer")
			.style("fill", "red")
			.attr("r", 8)
			.on('click', function(d){

				console.log(d);

				// set circles all inactive style, set this active
				group1.selectAll("circle").style("opacity", 0.5).attr("r", 5);
				d3.select(this).style({opacity:'0.8'}).attr("r", 10);

				// redraws ALL lines
				// TODO can probably do this more efficiently, e.g. just update style
				targetId = d.properties.id;
				drawConnections(targetId);
			});


		function update() {
			console.log('update');
			drawConnections(targetId);
			feature.attr("transform",
				function(d) {
					return "translate("+
						map.latLngToLayerPoint(d.properties.LatLng).x +","+
						map.latLngToLayerPoint(d.properties.LatLng).y +")";
				}
			);
		}

		function getPointById(id){
			return _.find(data, function(site){
				return site.properties.id == id;
			});
		}


		var mode = 'BOTH'; // || SINK || ALL

		function drawConnections(targetId){

			group2.selectAll(".connection").remove();

			_.each(data, function(site){

				var targetPoint = map.latLngToLayerPoint(site.properties.LatLng);
				var conKeys = _.keys(site.connections);

				_.each(conKeys, function(conKey){

					var conSite = getPointById(conKey);
					if(!conSite || !site.connections[conKey]) return;
					var conPoint = map.latLngToLayerPoint(conSite.properties.LatLng);

					var conValue = site.connections[conKey];
					var val = parseInt(linearScale(conValue));

					var color = 'grey';
					var opacity = 0.2;

					if(targetId){

						if(visMode == 'SOURCE' && targetId == site.properties.id){
							color = 'red';
							opacity = 0.8;
						}
						else if(visMode == 'SINK' && targetId == conKey){
							color = 'green';
							opacity = 0.8;
						}
						else if(visMode == 'ANY') {
							if(targetId == site.properties.id){
								color = 'red';
								opacity = 0.8;
							}
							if(targetId == conKey){
								color = 'red';
								opacity = 0.8;
							}
						}
						else if(visMode == 'BOTH') {

							if(targetId == site.properties.id){
								color = 'red';
								opacity = 0.8;
							}
							if(targetId == conKey){
								color = 'green';
								opacity = 0.8;
							}

						}

					}

					var line = group2.append("line")
						.attr("class", "connection")
						.attr("x1", targetPoint.x)
						.attr("y1", targetPoint.y)
						.attr("x2", conPoint.x)
						.attr("y2", conPoint.y)
						.attr("stroke-width", val)
						.attr("stroke-opacity", opacity)
						.attr("stroke", color);

				});
			});

		};

		map.on("moveend", update);
		update();



		$('input[type=radio][name=mode]').change(function() {
			console.log(this.value);
			visMode = this.value;
			drawConnections(targetId);
		});

	}

};
