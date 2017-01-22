var routeGetter = require("./node_modules/roadtripData-master/getRoute");

var d3node = require("./node_modules/d3-node");
var d3 = require("./node_modules/d3");
var d3request = require("./node_modules/d3-request");
var roadtriplog = require("../files/roadtrip_log.json");
var error, data;

//console.log(roadtriplog[0]);

roadtriplog.forEach(function(element, index) {
//	console.log(index)
	setTimeout(getRouteCallback, 500 * index);
	function getRouteCallback() {
		routeGetter.getRoute(element.start_loc, element.end_loc, element.waypoints, Date.parse(element.start_date), element.name)
	}
});



