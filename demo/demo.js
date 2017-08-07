$(document).ready(function(){

	$.get('demo.json', function(data, resType){

		if(resType == 'success'){
			init(data);
		}
		else {
			console.log('failed to load data');
		}
	});

	function init(data){

		//var map = L.map('map').setView([-25, 134], 5);

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
			data: data
		});

		// add layer as an overlay
		layerControl.addOverlay(networkLayer, 'Network Example');
	}


});