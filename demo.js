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

		var globalWeightMode = true;

		// init the network layer
		var networkLayer = L.networkLayer({

			data: data,
			globalWeightMode: globalWeightMode,

			onMouseEnterNode: function(node){
				var count = Object.values(node.connections).filter(v => v).length;
				var content = `ID: ${node.properties.id}, Source for: ${count}`;
				$("#tooltip").html(content);
				$("#tooltip").show();
			},

			onMouseLeaveNode: function(node){
				$("#tooltip").html();
				$("#tooltip").hide();
			},

			onMouseEnterLine: function(){
				console.log('Connection weight: ' + $(this).data('weight'));
			}
		});

		// add layer as an overlay
		layerControl.addOverlay(networkLayer, 'Network Example');

		// example of changin displayMode option
		$('input[type=radio][name=mode]').change(function(){
			networkLayer.setDisplayMode(this.value);
		});

		// example clear selection
		$('#clear').click(() => {
			networkLayer.setTarget(null);
		});

		// example setOptions
		$('#toggleScope').click(() => {
			globalWeightMode = !globalWeightMode;
			networkLayer.setOptions({ globalWeightMode: globalWeightMode });
		});
	}


});