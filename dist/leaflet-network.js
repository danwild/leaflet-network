'use strict';

L.NetworkLayer = (L.Layer ? L.Layer : L.Class).extend({

	/*------------------------------------ LEAFLET CONFIG ------------------------------------------*/

	options: {
		data: null,
		displayMode: 'ANY',
		globalWeightMode: true,
		localColorScale: ['green', 'red'],
		sourceColor: 'red',
		sinkColor: 'green',
		allColor: 'blue',
		scaleDomain: null,
		lineWidthRange: [1, 5],
		nodeFillColor: 'red',
		nodeOpacity: 0.5,
		nodeRadius: 5,
		onMouseEnterNode: null,
		onMouseLeaveNode: null,
		onMouseEnterLine: null,
		onMouseLeaveLine: null
	},

	_active: false,
	_map: null,
	_mapSvg: null, // our root SVG layer
	_svgGroup1: null,
	_svgGroup2: null,
	_targetId: null,
	_linearWidthScale: null,
	_localColors: [],

	initialize: function initialize(options) {
		L.setOptions(this, options);
	},

	onAdd: function onAdd(map) {
		var _this = this;

		var self = this;
		this._active = true;

		// delete self-connections
		var data = this.options.data.map(function (d) {
			delete d.connections[d.properties.id];
			return d;
		});

		// the target/currently inspected site ID, and mode of inspection
		this._targetId = null;

		// calc domain range if not provided in options
		var scaleDomain;
		if (this.options.scaleDomain) {
			scaleDomain = this.options.scaleDomain;
		} else {
			scaleDomain = this._getConnectionsDomain(data);
		}

		// prep color and width scales
		this.options.localColorScale.forEach(function (color) {
			_this._localColors.push(d3.rgb(color));
		});
		this._linearWidthScale = d3.scaleLinear().domain(scaleDomain).range(this.options.lineWidthRange);

		// initialize the SVG layer
		this._mapSvg = L.svg();
		this._mapSvg.addTo(map);

		// we simply pick up the SVG from the map object
		var svg = d3.select('#' + map.getContainer().id).select("svg");

		// leaflet svg has pointer events disabled by default..
		svg.attr("pointer-events", "all");
		this._svgGroup1 = svg.append("g");
		this._svgGroup2 = this._svgGroup1.append("g");

		// add a leaflet position to each site
		data.forEach(function (site) {
			site.properties.LatLng = new L.LatLng(site.properties.lat, site.properties.lon);
		});

		// create site circles
		this._svgGroup1.selectAll("circle").data(data.map(function (d) {
			return d;
		})).attr("class", "site").enter().append("circle").style("opacity", self.options.nodeOpacity).style("cursor", "pointer").style("fill", self.options.nodeFillColor).attr("r", self.options.nodeRadius).on('click', function (d) {
			console.log(d);
			// set circles all inactive style, set this active
			self._svgGroup1.selectAll("circle").style("opacity", 0.5).attr("r", 5);
			d3.select(this).style('opacity', '0.8').attr("r", 10);

			// redraws ALL lines
			// TODO can probably do this more efficiently, e.g. just update style
			self._targetId = d.properties.id;
			self._drawConnections(self._targetId);
		}).on('mouseenter', this.options.onMouseEnterNode).on('mouseleave', this.options.onMouseLeaveNode);

		this._map = map;
		this._map.on("moveend viewreset", this.update, this);
		this.update();
	},

	onRemove: function onRemove(map) {
		this._active = false;
		this._mapSvg.removeFrom(map);
	},

	/*------------------------------------ PUBLIC METHODS ------------------------------------------*/

	/**
  * Trigger a redraw of all elements using current target
  */
	update: function update() {
		var self = this;
		self._drawConnections(this._targetId);
		if (!this._targetId) self._svgGroup1.selectAll("circle").style("opacity", 0.5).attr("r", self.options.nodeRadius);
		this._svgGroup1.selectAll("circle").attr("transform", function (d) {
			return "translate(" + self._map.latLngToLayerPoint(d.properties.LatLng).x + "," + self._map.latLngToLayerPoint(d.properties.LatLng).y + ")";
		});
	},

	/**
  * Update the layer with new data
  * @param {Object} data
  */
	setData: function setData(data) {
		this.options.data = data;
		if (this._active) this.update();
	},

	/**
  * Set the active target node by id
  * @param {String} id
  */
	setTarget: function setTarget(id) {
		this._targetId = id;
		if (this._active) this.update();
	},

	/**
  * Set the layer display mode (triggers update)
  * @param mode {String} One of: ['SOURCE', 'SINK', 'ALL', 'BOTH']
  */
	setDisplayMode: function setDisplayMode(mode) {
		this.options.displayMode = mode;
		if (this._active) this.update();
	},

	/**
  * Get a node by id
  * @param id {String}
  * @returns {Object}
  */
	getPointById: function getPointById(id) {
		var data = this.options.data;
		for (var i = 0; i < data.length; i++) {
			if (id == data[i].properties.id) {
				return data[i];
			}
		}
	},

	/**
  * Test if layer is active on the map
  * @returns {boolean}
  */
	isActive: function isActive() {
		return this._active;
	},

	/*------------------------------------ PRIVATE ------------------------------------------*/

	_getConnectionsDomain: function _getConnectionsDomain(data) {
		var connections = [];
		data.forEach(function (d) {
			connections = connections.concat(Object.values(d.connections));
		});
		var min = d3.min(connections);
		var max = d3.max(connections);
		return [min, max];
	},

	_drawConnections: function _drawConnections(targetId) {

		var self = this;
		var map = this._map;
		var data = this.options.data;
		var svgGroup2 = this._svgGroup2;

		svgGroup2.selectAll(".connection").remove();

		var sources = [];
		var sinks = [];

		// process connections, drawing all inactive ones
		// if globalWeightMode we draw globally weighted connections (line width)
		// otherwise build array of node sites so we can compute localised scale before we draw
		data.forEach(function (site) {

			var conKeys = Object.keys(site.connections);

			// each connection
			conKeys.forEach(function (conKey) {

				var conSite = self.getPointById(conKey);
				if (!conSite || !site.connections[conKey]) return;

				// styles for connection not related to target
				var color = 'grey';
				var opacity = 0.2;
				var conValue = site.connections[conKey];

				// local scope weighting
				// we only take the target connection
				if (targetId && !self.options.globalWeightMode) {

					if (targetId === site.properties.id) {
						var target = { properties: site.properties, connections: {} };
						target.connections[conKey] = site.connections[conKey];
						sources.push(target);
						return;
					} else if (targetId === conKey) {
						var _target = { properties: site.properties, connections: {} };
						_target.connections[conKey] = site.connections[conKey];
						sinks.push(_target);
						return;
					}

					// global scope weighting
				} else if (targetId && self.options.globalWeightMode) {

					if (self.options.displayMode == 'SOURCE' && targetId == site.properties.id) {
						color = self.options.sourceColor;
						opacity = 0.8;
					} else if (self.options.displayMode == 'SINK' && targetId == conKey) {
						color = self.options.sinkColor;
						opacity = 0.8;
					} else if (self.options.displayMode == 'ANY') {
						if (targetId == site.properties.id || targetId == conKey) {
							color = self.options.allColor;
							opacity = 0.8;
						}
					} else if (self.options.displayMode == 'BOTH') {

						if (targetId == site.properties.id) {
							color = self.options.sourceColor;
							opacity = 0.8;
						}
						if (targetId == conKey) {
							color = self.options.sinkColor;
							opacity = 0.8;
						}
					}
				}

				// draw inactive of globally weighted line
				var targetPoint = map.latLngToLayerPoint(site.properties.LatLng);
				var conPoint = map.latLngToLayerPoint(conSite.properties.LatLng);
				var lineWidth = parseInt(self._linearWidthScale(conValue));

				svgGroup2.append("line").attr("class", "connection").attr("x1", targetPoint.x).attr("y1", targetPoint.y).attr("x2", conPoint.x).attr("y2", conPoint.y).attr("stroke-width", lineWidth).attr("stroke-opacity", opacity).attr("stroke", color);
			});
		});

		// if we are in local weighting mode, we need to
		// calculate a localised scale for SOURCE/SINK connections
		// then use the scale to color the lines

		//  2 x color scales with independent domains, sources dashed line
		if (self.options.displayMode === 'BOTH') {

			var localSinkDomain = this._getConnectionsDomain(sinks);
			var sinkScale = d3.scaleLinear().domain(localSinkDomain).interpolate(d3.interpolateHcl).range(self._localColors);
			this._drawLocalWeightedNodes(sinks, sinkScale, svgGroup2, "10, 3");

			var localSourceDomain = this._getConnectionsDomain(sources);
			var sourceScale = d3.scaleLinear().domain(localSourceDomain).interpolate(d3.interpolateHcl).range(self._localColors);
			this._drawLocalWeightedNodes(sources, sourceScale, svgGroup2, null);

			// a single color scale, combined domain for ALL
		} else {
			var nodes;
			switch (self.options.displayMode) {
				case 'SINK':
					nodes = sinks;
					break;
				case 'SOURCE':
					nodes = sources;
					break;
				case 'ANY':
					nodes = sinks.concat(sources);
					break;
				default:
					console.error('Invalid displayMode');
					break;
			}

			var localDomain = this._getConnectionsDomain(nodes);
			var colorScale = d3.scaleLinear().domain(localDomain).interpolate(d3.interpolateHcl).range(self._localColors);

			this._drawLocalWeightedNodes(nodes, colorScale, svgGroup2, null);
		}
	},

	_drawLocalWeightedNodes: function _drawLocalWeightedNodes(nodes, colorScale, svgGroup, dashStyle) {

		var self = this;

		nodes.forEach(function (node) {

			var conKeys = Object.keys(node.connections);
			conKeys.forEach(function (conKey) {

				var conSite = self.getPointById(conKey);
				if (!conSite || !node.connections[conKey]) return;
				var conValue = node.connections[conKey];
				var targetPoint = self._map.latLngToLayerPoint(node.properties.LatLng);
				var conPoint = self._map.latLngToLayerPoint(conSite.properties.LatLng);

				svgGroup.append("line").attr("class", "connection").attr("x1", targetPoint.x).attr("y1", targetPoint.y).attr("x2", conPoint.x).attr("y2", conPoint.y).attr("stroke-width", 2).attr("stroke-opacity", 0.9).attr("stroke", colorScale(conValue)).attr("data-weight", conValue).style("cursor", "pointer").style("stroke-dasharray", dashStyle).on('mouseenter', self.options.onMouseEnterLine).on('mouseleave', self.options.onMouseLeaveLine);
			});
		});
	}

});

L.networkLayer = function (options) {
	return new L.NetworkLayer(options);
};