var routeGetter = require("./node_modules/roadtripData-master/getRoute");

var d3node = require("./node_modules/d3-node");
var d3 = require("./node_modules/d3");
var d3request = require("./node_modules/d3-request");
var roadtriplog = require("../files/roadtrip_log.json");
var error, data;

//console.log(roadtriplog[0]);

roadtriplog.forEach(function(d) {
	setTimeout(getRouteCallback,2000);

	function getRouteCallback() {
	routeGetter.getRoute(d.start_loc, d.end_loc, d.waypoints, Date.parse(d.start_date), d.name)
}

});



