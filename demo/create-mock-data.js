const fs = require('fs');

// options
var numPoints = 50;
var connectionWeightMin = 0;
var connectionWeightMax = 100;
var latMin = -42;
var latMax = -12;
var lonMin = 112;
var lonMax = 154;

// mock it
var ids = createIds(numPoints);
var data = createData(ids);
writeFile(data, 'data/mock.json');

/**
 * Get a random number within given range
 * @param from
 * @param to
 * @param fixed
 * @returns {number}
 */
function getRandomInRange(from, to, fixed) {
	return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

function createData(ids){

	var output = [];

	for(var i = 0; i < ids.length; i++){

		var id = ids[i];
		var lat = getRandomInRange(latMin, latMax, 3);
		var lon = getRandomInRange(lonMin, lonMax, 3);
		var dataPoint = {
			properties: {
				id: id,
				lat: lat,
				lon: lon
			},
			connections: createConnections(ids)
		};

		output.push(dataPoint);
	}

	return output;
}

function createConnections(ids){

	var connections = {};

	for(var i = 0; i < ids.length; i++){

		// throw some null connections in for good measure
		var conWeight = (i % 2 > 0 || i % 3 > 0 || i % 4 > 0) ? 0 : getRandomInRange(connectionWeightMin, connectionWeightMax, 0);
		connections[ids[i]] = conWeight;
	}

	return connections;
}

function createIds(numPoints){
	var ids = [];
	for(var i = 0; i < numPoints; i++){
		ids.push(i);
	}
	return ids;
}

function writeFile(data, path){
	var jsonOut = fs.createWriteStream(path);
	jsonOut.write(JSON.stringify(data));
	jsonOut.on('error', function(err) { console.log(err); });
	jsonOut.end();
	console.log("done!");
}