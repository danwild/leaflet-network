L.NetworkLayer = (L.Layer ? L.Layer : L.Class).extend({

	options: {
		data: null,
		displayMode: 'SOURCE'
	},

	_map: null,
	_mapSvg: null, // our root SVG layer
	_svgGroup1: null,
	_svgGroup2: null,
	_targetId: null,
	_linearScale: null,

	initialize: function(options) {
		L.setOptions(this, options);
	},

	onAdd: function(map) {

		var self = this;
		var data = this.options.data;

		// the target/currently inspected site ID, and mode of inspection
		this._targetId = null;

		// TODO
		// scale matrix values to a consistent range, this needs work
		this._linearScale = d3.scale.linear().domain([0,100]).range([1,5]);

		// initialize the SVG layer
		this._mapSvg = L.svg();
		this._mapSvg.addTo(map);

		// we simply pick up the SVG from the map object
		var svg = d3.select("#map").select("svg");

		// leaflet svg has pointer events disabled by default..
		svg.attr("pointer-events", "all");
		this._svgGroup1 = svg.append("g");
		this._svgGroup2 = this._svgGroup1.append("g");

		// add a leaflet position to each site
		data.forEach(function(site){
			site.properties.LatLng = new L.LatLng(site.properties.lat, site.properties.lon);
		});

		// create site circles
		this._svgGroup1.selectAll("circle")
			.data(data.map(function(d){ return d; }))
			.attr("class", "site")
			.enter().append("circle")
			.style("opacity", .5)
			.style("cursor", "pointer")
			.style("fill", "red")
			.attr("r", 5)
			.on('click', function(d){

				console.log(d);

				// set circles all inactive style, set this active
				self._svgGroup1.selectAll("circle").style("opacity", 0.5).attr("r", 5);
				d3.select(this).style({opacity:'0.8'}).attr("r", 10);

				// redraws ALL lines
				// TODO can probably do this more efficiently, e.g. just update style
				self._targetId = d.properties.id;
				self._drawConnections(self._targetId);
			});

		this._map = map;
		this._map.on("moveend", this.update, this);
		this.update();
	},

	update: function() {
		console.log('update');
		var self = this;
		self._drawConnections(this._targetId);
		this._svgGroup1.selectAll("circle").attr("transform",
			function(d) {
				return "translate("+
					self._map.latLngToLayerPoint(d.properties.LatLng).x +","+
					self._map.latLngToLayerPoint(d.properties.LatLng).y +")";
			}
		);
	},

	getPointById: function(id){
		var data = this.options.data;
		for(var i = 0; i < data.length; i++){
			if(id == data[i].properties.id){
				return data[i];
			}
		}
	},

	onRemove: function(map) {
		this._mapSvg.removeFrom(map);
	},

	setData: function setData(data) {
		this.options.data = data;
		this._drawConnections();
	},

	/*------------------------------------ PRIVATE ------------------------------------------*/

	_drawConnections: function(targetId){

		var self = this;
		var map = this._map;
		var data = this.options.data;
		var svgGroup2 = this._svgGroup2;

		svgGroup2.selectAll(".connection").remove();

		data.forEach(function(site){

			var targetPoint = map.latLngToLayerPoint(site.properties.LatLng);
			var conKeys = Object.keys(site.connections);

			conKeys.forEach(function(conKey){

				var conSite = self.getPointById(conKey);
				if(!conSite || !site.connections[conKey]) return;
				var conPoint = map.latLngToLayerPoint(conSite.properties.LatLng);

				var conValue = site.connections[conKey];
				var val = parseInt(self._linearScale(conValue));

				var color = 'grey';
				var opacity = 0.2;

				if(targetId){

					if(self.options.displayMode == 'SOURCE' && targetId == site.properties.id){
						color = 'red';
						opacity = 0.8;
					}
					else if(self.options.displayMode == 'SINK' && targetId == conKey){
						color = 'green';
						opacity = 0.8;
					}
					else if(self.options.displayMode == 'ANY') {
						if(targetId == site.properties.id){
							color = 'red';
							opacity = 0.8;
						}
						if(targetId == conKey){
							color = 'red';
							opacity = 0.8;
						}
					}
					else if(self.options.displayMode == 'BOTH') {

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

				svgGroup2.append("line")
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