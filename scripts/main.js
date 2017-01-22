var w=960;
var h=720;
var routeFilesLoc = "scripts/geojson/";
var routeFilesExt = ".geojson";

var svg = d3.select("div").append("svg")
	.attr("width", w)
	.attr("height", h)
	.attr("id", "map");

var projection = d3.geoAlbers();

var path = d3.geoPath(projection);

d3.queue()
    .defer(d3.json, "files/us-states.json")
    .defer(d3.json, "files/roadtrip_log.json")
    .await(ready);


function ready(error, usStates, triplog) {
	loadMap(usStates);
	parseLog(triplog);	
}

function loadMap(usStates) {
	var usagroup = svg.append("g").attr("class", "usa");

	usagroup.attr("y", 100);

	usagroup.selectAll("path")
		.data(usStates.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("y", 100);
}

function parseLog(triplog) {

	//draw time axis
	

	triplog.forEach(function(d) {
		var routeFile = routeFilesLoc + Date.parse(d.start_date) + routeFilesExt;
		d3.json(routeFile, drawRoute);
	});
}

function drawRoute(route) {
	var i = 0;
	var coords = [];

	for(; i < route.features.length; i++) {
		coords[i] = route.features[i].geometry.coordinates;
	}

	route.features[0].geometry.type="LineString";
	route.features[0].geometry.coordinates = coords;
	route.features.splice(1, route.features.length-1);

	var routegroup = svg.append("g").attr("class", "routeGroup")

	var linePath = routegroup.selectAll("path")
		.data(route.features)
		.enter()
		.append("path")
		.attr("d", path)
		.classed("route", true);

	var totalLength = linePath.node().getTotalLength();

	linePath
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
}

