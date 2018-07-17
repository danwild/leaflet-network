# leaflet-network [![npm version][npm-image]][npm-url] [![NPM Downloads][npm-downloads-image]][npm-url]

**ALPHA** leaflet plugin to visualise (weighted) network connectivity between spatial data points.
It uses [d3.js v4](http://d3js.org) to visualise the network connections on a `L.SVG` layer.

Node connectivity weights can be represented:
- **Globally:** node connection strength scaled against all others,
and represented by width of the connecting line (range defined via `lineWidthRange`)
- **Locally:** node connection strength is scaled only by the connections it has using the current `displayMode`,
and represented by color of the connecting lines (range defined via `localColorScale`).

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

	// domain is the min/max range of values within the input data, defaults to auto fit to data
	scaleDomain: [0, 100],

	// pixel range the the min/max range we should scale the data to, defaults to [1, 5]
	lineWidthRange: [1, 5],

	// if true, connection weight is calculated in global scope
	// (i.e. against all connections) and is represented by line width
	// if false, connection weight is calculated using the local scope of the active node (scale is fitted to a
	// single nodes own connection weights), and is represented by line color
	globalWeightMode: true,

	// the color scale to use when globalWeightMode=false
	// note that when used with displayMode=BOTH, SOURCE/SINK connections will be
	// displayed on independent scales (to unify scales, use displayMode=ANY).
	localColorScale: ["green", "yellow", "red"],

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
|`setTarget`|`id: {String}`|Set the active target node by id|
|`setDisplayMode`|`mode: {String}`|one of: `SOURCE`, `SINK`, `ANY`, `BOTH`|
|`getPointById`|`id: {String}`|Get a node by id|
|`isActive`||Check if layer is active on the map|


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