$(document).ready(function(){

	$.get('./data/mock.json', function(data, resType){

		console.log(data);

		if(resType == 'success'){
			init(data);
		}
		else {
			console.log('failed to load data');
		}

	});

	function init(data){

		var canvas = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
			subdomains: 'abcd',
			maxZoom: 19
		});

		var baseLayers = {
			"Grey Canvas": canvas
		};

		var map = L.map('map', {
			layers: [ canvas ]
		});

		map.setView([-25, 134], 5);
		//var map = L.map('map').setView([-25, 134], 5);


		var layerControl = L.control.layers(baseLayers);
		layerControl.addTo(map);

		var networkLayer = L.networkLayer({
			data: data
		});


		layerControl.addOverlay(networkLayer, 'Network Example');

	}


});