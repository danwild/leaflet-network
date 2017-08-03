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

		var map = L.map('map').setView([-25, 134], 5);
		L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
			subdomains: 'abcd',
			maxZoom: 19
		}).addTo(map);

		LeafletNetwork.init(map, data);

	}

});