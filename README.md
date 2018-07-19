# leaflet-network [![npm version][npm-image]][npm-url] [![NPM Downloads][npm-downloads-image]][npm-url]

**ALPHA** leaflet plugin to visualise (weighted) network connectivity between spatial data points.
It uses [d3.js v4](http://d3js.org) to visualise the network connections on a `L.SVG` layer.

Node connectivity weights can be represented:
- **GLOBAL:** node connection weights are scaled against all other connections in the matrix.
- **LOCAL:** node connection weights are scaled to only the connections of the selected target.
- **NONE:** connection weights are ignored, simplified display.

This plugin only supports Leaflet ^v1.0.0.

![Screenshot](/screenshots/leaflet-network.png?raw=true)

## install, build

* install: `npm install leaflet-network`
* build: `gulp`

## usage

Init plugin with map and data (see gh-pages branch for full demo):

```javascript
// create a basemap
var canvas = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

// setup our leaflet map
var map = L.map('map', {
	layers: [ canvas ],
	center: L.latLng(-25, 134),
	zoom: 5
});

// create a layer control so we can show/hide network layer
var layerControl = L.control.layers();
layerControl.addTo(map);

// init the network layer
var networkLayer = L.networkLayer({

	// see expected data format below
	data: data,

	// One of:
	// - SOURCE: visualise connections that are downstream from the target node
	// - SINK:   visualise connections that are upstream from the target node
	// - ANY:    visualise any connections related to the target node (useful if not concerned with SOURCE/SINKs)
	// - BOTH:   visualise connections that are upstream or downstream from the target node, differs to ANY as it
	//   keeps SOURCE/SINK weightings separate, whereas ANY is a simple merge
	displayMode: 'SOURCE',

	// domain is the min/max boundaries of values that will be used to fit data to the range scale, defaults to auto
	// fit data (min, max-10%), often needs tweaking (depends on shape of your data)
	// if this terminology is confusing you, see:
	// https://javascript.tutorialhorizon.com/2015/01/17/d3-fundamentals-understanding-domain-range-and-scales-in-d3js/
	globalScaleDomain: [0, 100],

	// If provided, any data (weights) outside of the clipRange will be ignored
	clipRange: [25, 75],

	// How the connection weights should be scaled
	// One of: ['GLOBAL', 'LOCAL', 'NONE']
	weightMode: 'GLOBAL',

	// the color scale to use to represent connection strengths
	// note that when used with displayMode=BOTH, SOURCE/SINK connections will be
	// displayed on independent scales (to unify scales, use displayMode=ANY).
	colorScale: ["green", "yellow", "red"],

	// color for connections when not scaled colors
	// i.e. weightMode='NONE'
	sourceColor: 'red',
	sinkColor: 'green',
	allColor: 'blue',

	// styling options for node circles
	nodeFillColor: 'red',
	nodeRadius: 5,
	nodeOpacity: 0.5,

	// styling for connection lines
	lineInactiveColor: 'grey',
	lineOpacity: 0.8,
	lineWidth: 2,
	lineWidthActive: 2,
	lineDashStyle: ("20, 3") // e.g. draw 20, dash 3

	// callback function for click event on node, receives target node
	onClickNode: function(node){
	  // e.g. add clear selection button
	},

	// callback function for mouseenter event on node, receives target node
	onMouseEnterNode: function(node){
	  // e.g. set a tooltip
	},

	// callback function for mouseleave event on node, receives target node
	onMouseLeaveNode: function(node){
	  // e.g. remove a tooltip
	}

	// callback function for mouseenter event on line, receives dom elem
	// which has some data attributes, e.g. weight, lat, long
	onMouseEnterLine: function(elem){
	  // e.g. display elem.dataset.weight

	},

	// callback function for mouseleave event on line, receives dom elem
	// which has some data attributes, e.g. weight, lat, long
	onMouseLeaveLine: function(elem){
	  // e.g. hide weight
	}

});

// add layer as an overlay
layerControl.addOverlay(networkLayer, 'Network Example');
```

## public methods

|method|params|description|
|---|---|---|
|`update`||trigger a redraw of all elements using current target|
|`setData`|`data: {Object}`|update the layer with new data|
|`setOptions`|`options: {Object}`|update the layer with new options|
|`setTarget`|`id: {String}`|Set the active target node by id|
|`getTargetId`||Get ID of the active target node|
|`setDisplayMode`|`mode: {String}`|one of: `SOURCE`, `SINK`, `ANY`, `BOTH`|
|`getPointById`|`id: {String}`|Get a node by id|
|`isActive`||Check if layer is active on the map|
|`getConnectionsDomain`|Optional: `data: {Object}`|Get the domain (min/max) of values in the data array (defaults to current)|

## data format

```javascript
var data = [
  {
    "properties": {
      "lat": "",
      "lon": "",
      "id": "uid1"
    },
    "connections": {
      "uid1": 233,    // connection score to self, ignored
      "uid2": 0,      // null connection, could be omited
      "uid2": 37      // defines a connection score of 37 with point uid2
    }
  },
  {...}
]
```

## shout outs

* [Mike Bostock](https://bost.ocks.org/mike/) for d3.js
* [d3noob](http://bl.ocks.org/d3noob/9267535) for d3/leaflet/svg demo

## License
MIT License (MIT)

[npm-image]: https://badge.fury.io/js/leaflet-network.svg
[npm-url]: https://www.npmjs.com/package/leaflet-network
[npm-downloads-image]: https://img.shields.io/npm/dt/leaflet-network.svg