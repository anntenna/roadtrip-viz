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

    usagroup.selectAll("path")
        .data(usStates.features)
        .enter()
        .append("path")
        .attr("d", path);
}

function parseLog(triplog) {

    //draw time axis
    triplog.sort(function(x, y){
        return d3.ascending(Date.parse(x.start_date), Date.parse(y.start_date));
    });

    logData = crossfilter(triplog);
    startDateDimension = logData.dimension(function(d) { return d.start_date; });
    
    triplog.forEach(function(element, index) {

        // Get the geojson file for each of the trips...
        setTimeout(getRouteCallback, 200 * index);

        function getRouteCallback() {
            // Get the route...
            routeGetter.getRoute(element.start_loc, element.end_loc, element.waypoints, Date.parse(element.start_date), element.name)

            // Now draw the route with D3..
            var routeFile = routeFilesLoc + Date.parse(element.start_date) + routeFilesExt;
            d3.json(routeFile, drawRoute);
        }
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

