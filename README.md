# leaflet-network

Leaflet plugin to visualise network connectivity between spatial data points.
It uses [d3.js v3](http://d3js.org) to visualise the network connections on a `L.svg` layer.

This plugin only supports Leaflet ^v1.0.0.

## usage
...

## data format

```javascript
var data = [
	{
		"properties": {
			"lat": "",
			"lon": "",
			"id": ""
		},
		"connections": {
			"uid1": 233, // connections to self ignored
			"uid2": 0,
			"uid2": 37
		}
	},
	{...}
]
```

## TODO
* build properly with gulp
* move static resources to npm
* check `leaflet-network` name is available on npm
* Try to keep this a generic Leaflet plugin, make a public branch with some mock data points for demo

```
function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    // .toFixed() returns string, so ' * 1' is a trick to convert to number
}
```

## shout outs

* Mike
* [d3noob](http://bl.ocks.org/d3noob/9267535)