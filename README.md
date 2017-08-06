# leaflet-network

Leaflet plugin to visualise network connectivity between spatial data points.
It uses [d3.js v3](http://d3js.org) to visualise the network connections on a `L.SVG` layer.

This plugin only supports Leaflet ^v1.0.0.

## usage

* `npm install leaflet-network`
* init plugin with map and data..
* ...

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

## TODO
* something funny with mock data generation, bias to SOURCE
* build properly with gulp
* move static resources to npm
* check `leaflet-network` name is available on npm
* Try to keep this a generic Leaflet plugin, make a public branch with some mock data points for demo

## shout outs

* Mike
* [d3noob](http://bl.ocks.org/d3noob/9267535)