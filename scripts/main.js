var w=960;
var h=720;
var timeh = 100;
var padding = 25;
var routeFilesLoc = "scripts/geojson/";
var routeFilesExt = ".geojson";
var timeScale = d3.scaleTime();
var triplogGlobal;

var timeSvg = d3.select("div#timeline").append("svg")
	.attr("width", w)
	.attr("height", timeh)
	.attr("id", "timeline");

var mapSvg = d3.select("div#map").append("svg")
	.attr("width", w)
	.attr("height", h)
	.attr("id", "map");

var marker;

var projection = d3.geoAlbers();

var path = d3.geoPath(projection);

d3.queue()
    .defer(d3.json, "files/us-states.json")
    .defer(d3.json, "files/roadtrip_log.json")
    .await(ready);


function ready(error, usStates, triplog) {
	triplogGlobal = triplog;

	//sort data
	triplogGlobal.sort(function(x, y){
		   return d3.ascending(Date.parse(x.start_date), Date.parse(y.start_date));
        });
	
	loadMap(usStates);

	var q = d3.queue();
	triplogGlobal.forEach(function(d) {
		var routeFile = routeFilesLoc + Date.parse(d.start_date) + routeFilesExt;
		q.defer(d3.json, routeFile);
	})
	q.awaitAll(parseLog);	
}

function loadMap(usStates) {
	var usagroup = mapSvg.append("g").attr("class", "usa")
		.attr("z-index",-1);

	usagroup.selectAll("path")
		.data(usStates.features)
		.enter()
		.append("path")
		.attr("d", path);
}

function parseLog(error, results) {
	if (error) throw error;


	//draw time axis
	var firstStartdate = triplogGlobal[0].start_date;
	drawTimeline(firstStartdate);

	var routegroup = mapSvg.append("g").attr("class", "routeGroup")

	var markerGroup = mapSvg.append("g").attr("class", "marker");
	
	marker = markerGroup.append("circle")
		.classed("routeMarker", true)
		.attr("r", 5)
		.attr("transform", "translate(-50000,-50000)")
	
	var thisRouteDetailsDiv = d3.selectAll("span");
	thisRouteDetailsDiv.text(0);

	

	animate(results);

	

	logDataCF = crossfilter(triplogGlobal);
	startDateDimension = logDataCF.dimension(function(d) { return d.start_date; });

}

function drawTimeline(firstStartdate) {
	var firstStartDate = new Date(firstStartdate);
	var firstStartYear = firstStartDate.getFullYear();

	var jan1StartDate = new Date("January 1, " + firstStartYear);
	var todayDate = new Date();
	var todayYear = todayDate.getFullYear();

	timeScale.domain([jan1StartDate, todayDate]);
	timeScale.range([0 + padding, w - padding]);

	var timeGroup = timeSvg.append("g")
		.classed("timeline", true);
	
	//draw line
	var timeLine = timeGroup.append("line")
		.attr("x1", timeScale(jan1StartDate))
		.attr("y1", timeh/2)
		.attr("x2", timeScale(todayDate))
		.attr("y2", timeh/2)
		.attr("id", "timeline");
	
	//add ticks
	var jan1Dates = [];
	var i;

	for(i = 0; i <= todayYear - firstStartYear; i++) {
		jan1Dates[i] = new Date("January 1, "  + (firstStartYear + i));
	}

	timeGroup.selectAll("line.timeTick")
		.data(jan1Dates)
		.enter()
		.append("line")
		.attr("class", "timeTick")
		.attr("x1", function(d) { return timeScale(d); })
		.attr("y1", timeh/2)
		.attr("x2", function(d) { return timeScale(d); })
		.attr("y2", timeh/2 - 15);

	//add tick labels
	timeGroup.selectAll("text")
		.data(jan1Dates)
		.enter()
		.append("text")
		.attr("class", "timeTick")
		.attr("x", function(d) { return timeScale(d) - 13; })
		.attr("y", timeh/2 - padding)
		.text(function(d) { return d.getFullYear();});

	timeGroup.append("circle")
		.attr("cx", padding)
		.attr("cy", timeh/2)
		.attr("r", 7.5)
		.attr("id", "timeCircle");

}

function animate(routes) {
	var timeCircle = timeSvg.select("#timeCircle");

	var animateq = d3.queue();
	var totalMiles = 0;
	var i = 0;

	triplogGlobal.forEach(function(d) {
		console.log(d.start_date);
		
		function renderRoute() {
			var routeId = Date.parse(d.start_date);
			var route = routes.find(function(r) { return r.properties.id == routeId; });
			drawRoute(route, i);
		}

		timeCircle.transition()
			.duration(1000)
			.attr("cx", timeScale(new Date(d.start_date)))
			.ease(d3.easeLinear)
			.delay(i * 2000)
			.on("end", renderRoute());

		var tweenCalc = function(x, selector) {
			var elem = d3.select(selector);
			var i = d3.interpolate(elem.node().textContent, d.miles);
      			return function(t) {
					elem.text(i(t));
      			};
		};
		
		
		//Edit div
		var thisRouteDetailsDiv = d3.select("span#tripMiles");
		thisRouteDetailsDiv.transition()
			.ease(d3.easeQuadOut)
			.duration(1000)
			.delay(1000*(i+1) + 1000*i)
			.tween("text", function(b) {
				var i = d3.interpolate(d3.select("span#tripMiles").node().textContent, d.miles);
				return function(t) {
					d3.select("span#tripMiles").text(parseInt(i(t),10));
				};
			});

		var overallMilesDiv = d3.select("span#overallMiles");
		overallMilesDiv
			.transition()
			.ease(d3.easeQuadOut)
			.duration(1000)
			.delay(1000*(i+1) + 1000*i)
			.tween("text", function(b) {
				var i = d3.interpolate(d3.select("span#overallMiles").node().textContent, parseInt(d3.select("span#overallMiles").node().textContent, 10) + d.miles);
				return function(t) {
					d3.select("span#overallMiles").text(parseInt(i(t),10));
				};
			});

		var tripNamePara = d3.select("p#tripNamePara");
		tripNamePara
			.transition()
			.text(d.name)
			.ease(d3.easeQuadOut)
			.duration(1000)
			.delay(1000*(i+1) + 1000*i);

		var tripDaysPara = d3.select("span#tripDays");
		tripDaysPara
			.transition()
			.ease(d3.easeQuadOut)
			.duration(1000)
			.delay(1000*(i+1) + 1000*i)
			.tween("text", function(b) {
				var i = d3.interpolate(d3.select("span#tripDays").node().textContent, d.duration_days);
				return function(t) {
					d3.select("span#tripDays").text(parseInt(i(t),10));
				};
			});

		var overallDaysDiv = d3.select("span#overallDays");
		overallDaysDiv
			.transition()
			.ease(d3.easeQuadOut)
			.duration(1000)
			.delay(1000*(i+1) + 1000*i)
			.tween("text", function(b) {
				var i = d3.interpolate(d3.select("span#overallDays").node().textContent, parseInt(d3.select("span#overallDays").node().textContent, 10) + d.duration_days);
				return function(t) {
					d3.select("span#overallDays").text(parseInt(i(t),10));
				};
			});
		

		i++;

	});

}

function drawRoute(route, j) {
	var i = 0;
	var coords = [];

	for(; i < route.features.length; i++) {
		coords[i] = route.features[i].geometry.coordinates;
	}

	route.features[0].geometry.type="LineString";
	route.features[0].geometry.coordinates = coords;
	route.features.splice(1, route.features.length-1);

	var routegroup = mapSvg.select("g.routeGroup").append("g").attr("class","route");


	var linePath = routegroup.selectAll("path")
		.data(route.features)
		.enter()
		.append("path")
		.attr("d", path)
		.classed("route", true);

	//Get path start point for placing marker
	function pathStartPoint(path) {
		var d = path.attr("d"),
		dsplitted = d.split("L");
		return dsplitted[1].split(",");
	}

	var startPoint = pathStartPoint(linePath);

	marker.attr("transform", "translate(" + startPoint +")");

	
	function translateAlong(path) {
    	var l = path.getTotalLength();
    	return function(i) {
      		return function(t) {
        		var p = path.getPointAtLength(t * l);
        		return "translate(" + p.x + "," + p.y + ")";//Move marker
      		}
    	}
  	}

	var totalLength = linePath.node().getTotalLength();

	linePath
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
	  .classed("active", true)
      .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
		.delay(1000*(j+1) + 1000*j)
		.transition()
		.style("stroke-width", "1px");
	
	marker.transition()
		.duration(1000)
		.attrTween("transform", translateAlong(linePath.node()))
		.ease(d3.easeLinear)
		.delay(1000*(j+1) + 1000*j)

	
}



