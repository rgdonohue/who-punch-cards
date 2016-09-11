var app = (function() {
    
    d3.queue()
        .defer(d3.json, 'data/countries.topo.json')
        .defer(d3.csv, 'data/country_vaccination/BCG.csv')
        .defer(d3.csv, 'data/country_vaccination/DTP1.csv')
        .defer(d3.csv, 'data/country_vaccination/DTP3.csv')
        .defer(d3.csv, 'data/country_vaccination/HEPB_BD.csv')
        .defer(d3.csv, 'data/country_vaccination/Hib3.csv')
        .defer(d3.csv, 'data/country_vaccination/MCV1.csv')
        .defer(d3.csv, 'data/country_vaccination/PAB.csv')
        .defer(d3.csv, 'data/country_vaccination/Pol3.csv')
        .defer(d3.csv, 'data/country_vaccination/RotaC.csv')
        .awaitAll(processData);

    function processData(error, allData) {

        var world  = allData.shift(),
            countriesData = {};
        
        
        allData.map(function(vaccineDatum) {   
            vaccineDatum.map(function(countryVaccineDatum) {
                
                // build object to hold all vaccination data
                // for each country
                if(countriesData[countryVaccineDatum.ISO_code]) {
                    countriesData[countryVaccineDatum.ISO_code][countryVaccineDatum.Vaccine] = countryVaccineDatum;
                } else {
                    countriesData[countryVaccineDatum.ISO_code] = {       };
                        countriesData[countryVaccineDatum.ISO_code][countryVaccineDatum.Vaccine] = countryVaccineDatum;
                }
                
                // add vaccination data to country geom properties
                world.objects.countries.geometries.map(function(country) { 
                    if(country.properties.iso === countryVaccineDatum.ISO_code) {
                        country.properties[countryVaccineDatum.Vaccine] = countryVaccineDatum;   
                    } 
                });
            });     
        });
        
        // makeMap(world);
        makeChart(countriesData);
    } // end processData
        
    function makeMap(world) {
        
            var width = 640,
        height = 363;
        
        //    
//    var projection = d3.geo.polyhedron.waterman()
//        .rotate([20, 0])
//        .scale(118)
//        .translate([width / 2, height / 2])
//        .precision(.1);
//    
    
        var projection = d3.geo.interrupt(d3.geo.homolosine.raw)
            .lobes([[ // northern hemisphere
              [[-180,   0], [-100,  90], [ -40,   0]],
              [[ -40,   0], [  30,  90], [ 180,   0]]
            ], [ // southern hemisphere
              [[-180,   0], [-160, -90], [-100,   0]],
              [[-100,   0], [ -60, -90], [ -20,   0]],
              [[ -20,   0], [  20, -90], [  80,   0]],
              [[  80,   0], [ 140, -90], [ 180,   0]]
            ]])
            .scale(100)
            .translate([width / 2, height / 2])
            .precision(.1);
                                        

        var path = d3.geo.path()
            .projection(projection);

        var graticule = d3.geo.graticule();

        var svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height);

        var defs = svg.append("defs");

        defs.append("path")
            .datum({type: "Sphere"})
            .attr("id", "sphere")
            .attr("d", path);

        defs.append("clipPath")
            .attr("id", "clip")
          .append("use")
            .attr("xlink:href", "#sphere");

        svg.append("use")
            .attr("class", "stroke")
            .attr("xlink:href", "#sphere");

        svg.append("use")
            .attr("class", "fill")
            .attr("xlink:href", "#sphere");

        svg.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("clip-path", "url(#clip)")
            .attr("d", path);
        
        var countries = svg.append("path")
          .datum(topojson.feature(world, world.objects.countries))
          .attr("class", "land")
          .attr("clip-path", "url(#clip)")
          .attr("d", path);

        svg.append("path")
          .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
          .attr("class", "boundary")
          .attr("clip-path", "url(#clip)")
          .attr("d", path);        
    
    } // end makeMap
    
    function makeChart(countriesData) {
        
        var currentIso = 'GIN';
        
        var chartWidth = Number(d3.select('#chart').style('width').slice(0,-2)),
            chartHeight = Number(d3.select('#chart').style('height').slice(0,-2));
        
        var svg = d3.select("#chart svg").attr('width', chartWidth).attr('height', chartHeight),
            margin = {top: 20, right: 80, bottom: 30, left: 50},
            width = chartWidth - margin.left - margin.right,
            height = chartHeight - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        var parseTime = d3.timeParse("%Y");
        
        var countryData = [];
          
        for(var vaccine in countriesData[currentIso]) {          
            
            var valuesArray = [];
            
            for(var timestamp in countriesData[currentIso][vaccine]) {
                
               if(Number(countriesData[currentIso][vaccine][timestamp])) {
                   
                   valuesArray.push({ 
                       year : parseTime(timestamp),
                       percentage : Number(countriesData.AFG[vaccine][timestamp])
                   });
               }
            }
            
            if(valuesArray.length > 0) {
                countryData.push({
                    id : vaccine,
                    values : valuesArray
                });
            }
        }
        
        var x = d3.scaleTime().range([0, width])
                .domain([parseTime(2010), parseTime(2015)]),
            y = d3.scaleLinear().range([height*2.5, 0])
                .domain([
                    d3.min(countryData, function(c) { 
                        return d3.min(c.values, function(d) { 
                            
                            return d.percentage;
                        })
                    }),
                    d3.max(countryData, function(c) { 
                        return d3.max(c.values, function(d) { 
                            return d.percentage; 
                        }) 
                    })
              ]),
              z = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(countryData.map(function(c) { return c.id; }));
        
        var line = d3.line()
            .curve(d3.curveBasis)
            .x(function(d) {  return x(d.year); })
            .y(function(d) {  return y(d.percentage); });
        
        g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));
        
        g.append("g")
              .attr("class", "axis axis--y")
              .call(d3.axisLeft(y))
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", "0.71em")
              .attr("fill", "#000")
              .text("Percente of Population Vaccinated");

      var vaccines = g.selectAll(".vaccine")
        .data(countryData)
        .enter().append("g")
        .attr("class", "vaccine");

      vaccines.append("path")
          .attr("class", "line")
          .attr("d", function(d) { return line(d.values); })
          .style("stroke", function(d) { return z(d.id); });
        
        vaccines.selectAll(".dot")
            .data(countryData.filter(function(d) { console.log(parseTime(2013)); return {x: 2014, y: 80}; }))
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", line.x())
            .attr("cy", line.y())
            .attr("r", 3.5);

      vaccines.append("text")
          .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.percentage) + ")"; })
          .attr("x", 3)
          .attr("dy", "0.35em")
          .style("font", "10px sans-serif")
          .text(function(d) { return d.id; });

        
    } // end makeChart
    
    
    
})();