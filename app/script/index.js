'use strict';

// Script Imports
import $ from 'jquery';
import * as d3 from 'd3';
import * as topojson from 'topojson';

// Style 
import '../style/index.scss';

// Data imports
import usmapfile from "../data/us-10m.v1.json";
import unemploymentfile from "../data/unemployment.tsv";
import euMapFile from "../data/europe.json";
import euMap2File from "../data/europe2.json";
import euMap3File from "../data/europe4-p.json";

$(() => {
    var svg = d3.select('#d3-root'),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var unemployment = d3.map();




    // var projection = d3.geo.albers()
    //     .center([0, 55.4])
    //     .rotate([4.4, 0])
    //     .parallels([50, 60])
    //     .scale(60)
    //     .translate([width / 2, height / 2]);

    //     var projection = d3.geo.mercator()
    // .scale(500)
    // .translate([width / 2, height / 2]);


    // var path = d3.geoPath()
    // .projection(projection);

    // var projection = d3.geoMercator() //utiliser une projection standard pour aplatir les pôles, voir D3 projection plugin
    //     .center([13, 52]) //comment centrer la carte, longitude, latitude
    //     .translate([width / 2, height / 2]) // centrer l'image obtenue dans le svg
    //     .scale([width / 1.5]); // zoom, plus la valeur est petit plus le zoom est gros 

    //Define path generator
    var path = d3.geoPath()
    // .projection(projection);

    var x = d3.scaleLinear()
        .domain([1, 10])
        .rangeRound([600, 860]);

    var color = d3.scaleThreshold()
        .domain(d3.range(2, 10))
        .range(d3.schemeGreens[9]);

    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,40)");

    g.selectAll("rect")
        .data(color.range().map(function (d) {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = x.domain()[0];
            if (d[1] == null) d[1] = x.domain()[1];
            return d;
        }))
        .enter().append("rect")
        .attr("height", 8)
        .attr("x", function (d) {
            return x(d[0]);
        })
        .attr("width", function (d) {
            return x(d[1]) - x(d[0]);
        })
        .attr("fill", function (d) {
            return color(d[0]);
        });

    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Unemployment rate");

    g.call(d3.axisBottom(x)
            .tickSize(13)
            .tickFormat(function (x, i) {
                return i ? x : x + "%";
            })
            .tickValues(color.domain()))
        .select(".domain")
        .remove();


    var countryFillColor = (d) => {
        if (d.properties.continent == 'Europe' && d.properties.name != 'Russia') {
            return "#FEE8C8";
        }
    };

    // Used to be done with d3 queue
    var promises = [];

    promises.push(d3.json(euMap3File));
    promises.push(d3.tsv(unemploymentfile));

    Promise.all(promises).then(function (values) {
        console.log(values);
        let eu = values[0];
        values[1].forEach(element => {
            unemployment.set(element.id, +element.rate);
        });;

        // svg.append("g")
        //     .data(eu.features)
        //     .enter()
        //     .append("path")
        //     .attr("d", path)
        //     .attr("stroke", "rgba(8, 81, 156, 0.2)")
        //     .attr("fill", "rgba(8, 81, 156, 0.6)");


        // geoproject 'd3.geoMercator().center([ 13, 52 ]).translate([ 1920/2, 960/2 ]).scale([960 / 1.5])' < europe3.json > europe5-p.json



        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(eu.features)
            .enter().append("path")
            // .attr("d", d3.geo.path().projection(d3.geo.mercator()));
            .attr("d", path)
            .attr("stroke", (d)=>{
                if (d.properties.continent == 'Europe' && d.properties.name != 'Russia') {
                    return '#F5735B';
                }else{
                    // return '#fcfcfc';
                }
            })
            .attr("fill", countryFillColor)
            .on('mouseover', function (d, i) {

                if (d.properties.continent == 'Europe' && d.properties.name != 'Russia') {
                    var currentState = this
                    d3.select(this).style('fill', '#FC8D59')
                }

            })
            .on('mouseout', function (d, i) {

                console.log('over');
                var currentState = this;
                d3.select(this).style('fill', countryFillColor(d))

            })
            .append("title")
            .text(function (d) {
                // console.log(d);
                return d.properties.name;
            });

        // svg.append("path")
        //     .datum(topojson.mesh(us, us.objects.states, function (a, b) {
        //         return a !== b;
        //     }))
        //     .attr("class", "states")
        //     .attr("d", path);

    });

});