# Anusha & Harish's Road trip log
[Link](https://d3fhb6r01zied7.cloudfront.net/)

This is a simple visualization of all the road trips my partner and I went on over the last 6 years. What started off as an idea for an anniversary gift ended up being an exercise in learning to work with a lot of different front-end tools.

The visualization works by reading data about each trip from a [csv file](https://github.com/anntenna/roadtrip-viz/blob/master/files/Road-trip-log.csv), looks up the route by querying a Google Maps API using [this NodeJS client](https://github.com/googlemaps/google-maps-services-js) for Google Maps if it's a new trip. A geojson file is generated for each route, and rendered with some fancy transitioning happening between trips. Routes that have already been generated are written to a file so that it can be rendered later without having to make the API call again.

The overall effect I wanted to achieve was a timeline of road trips and how much of the US we had covered so far, and where we'd like to go next.

![screen shot 2017-02-22 at 2 52 31 pm](https://cloud.githubusercontent.com/assets/18266617/23236583/95032fb6-f90e-11e6-8b2e-481d38a396e7.png)
