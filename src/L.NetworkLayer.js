L.NetworkLayer = (L.Layer ? L.Layer : L.Class).extend({

	options: {
		data: null,
		displayMode: 'SOURCE'
	},

	_map: null,
	_mapSvg: null, // our root SVG layer

	initialize: function(options) {
		L.setOptions(this, options);
	},

	onAdd: function(map) {

		var data = this.options.data;

		// the target/currently inspected site ID, and mode of inspection
		var targetId = null;
		//var displayMode = 'ANY';

		// TODO
		// scale matrix values to a consistent range, this needs work
		linearScale = d3.scale.linear().domain([0,100]).range([1,5]);

		// initialize the SVG layer
		this._mapSvg = L.svg();
		this._mapSvg.addTo(map);

		// we simply pick up the SVG from the map object
		var svg = d3.select("#map").select("svg");

		// leaflet svg has pointer events disabled by default..
		svg.attr("pointer-events", "all");
		this._svgGroup = svg.append("g");
		var svgGroup = this._svgGroup; // keep a ref for when *this* context changes
		var group2 = this._svgGroup.append("g");

		// add a leaflet position to each site
		_.each(data, function(site){
			site.properties.LatLng = new L.LatLng(site.properties.lat, site.properties.lon);
		});

		// create site circles
		var feature = svgGroup.selectAll("circle")
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
				svgGroup.selectAll("circle").style("opacity", 0.5).attr("r", 5);
				d3.select(this).style({opacity:'0.8'}).attr("r", 10);

				// redraws ALL lines
				// TODO can probably do this more efficiently, e.g. just update style
				targetId = d.properties.id;
				drawConnections(targetId);
			});

		map.on("moveend", update);
		update();
		this._map = map;
	},

	update: function() {
		console.log('update');
		this._drawConnections(targetId);
		feature.attr("transform",
			function(d) {
				return "translate("+
					map.latLngToLayerPoint(d.properties.LatLng).x +","+
					map.latLngToLayerPoint(d.properties.LatLng).y +")";
			}
		);
	},

	getPointById: function(id){
		return _.find(data, function(site){
			return site.properties.id == id;
		});
	},

	onRemove: function(map) {
		this._mapSvg.removeFrom(map);
	},

	// TODO redraw
	setData: function setData(data) {
		this.options.data = data;
		drawConnections();
	},

	/*------------------------------------ PRIVATE ------------------------------------------*/

	_drawConnections: function(targetId){

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

	}


});

L.networkLayer = function(options) {
	return new L.NetworkLayer(options);
};