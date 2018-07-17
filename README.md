# leaflet-network [![npm version][npm-image]][npm-url] [![NPM Downloads][npm-downloads-image]][npm-url]

Leaflet plugin to visualise (weighted) network connectivity between spatial data points.
It uses [d3.js v4](http://d3js.org) to visualise the network connections on a `L.SVG` layer.

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

	// domain is the min/max range of values within the input data, defaults to auto fit data
	scaleDomain: [0, 100],

	// range the the min/max range we should scale the data to, defaults to [1, 5]
	scaleRange: [1, 5],

	// callback function for mouseenter event on node, receives target node
	onMouseEnterNode: function(node){
	  // e.g. set a tooltip
	},

    // callback function for mouseleave event on node, receives target node
    onMouseLeaveNode: function(node){
      // e.g. remove a tooltip
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
|`setTarget`|`id: {String}`|display the particles at the given frame index|
|`setDisplayMode`|`mode: {String}`|one of: `SOURCE`, `SINK`, `ALL`, `BOTH`|
|`getPointById`|`id: {String}`|Get a node by id|

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

## todo
* circle points could derive radius size from source/sink score?
* better parameterization of styling etc.

## shout outs

* [Mike Bostock](https://bost.ocks.org/mike/) for d3.js
* [d3noob](http://bl.ocks.org/d3noob/9267535) for d3/leaflet/svg demo

## License
MIT License (MIT)

[npm-image]: https://badge.fury.io/js/leaflet-network.svg
[npm-url]: https://www.npmjs.com/package/leaflet-network
[npm-downloads-image]: https://img.shields.io/npm/dt/leaflet-network.svg