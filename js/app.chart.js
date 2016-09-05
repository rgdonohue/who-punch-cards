var app = (function (parent, d3) {


    var el = parent.el;
   

    var chartWidth = Number(d3.select('#chart').style('width').slice(0, -2)),
        chartHeight = Number(d3.select('#chart').style('height').slice(0, -2));

    var svg = d3.select("#chart svg").attr('width', chartWidth).attr('height', chartHeight),
        margin = {
            top: 20,
            right: 80,
            bottom: 30,
            left: 50
        },
        width = chartWidth - margin.left - margin.right,
        height = chartHeight - margin.top - margin.bottom;


    var parseTime = d3.timeParse("%Y");
    
    // object to store graph properites
    function chartParams(container, iso) {
        this.container = container;
        this.iso = iso;
        this.made = false;
//        this.label = label;
//        this.x = null;
//        this.x2 = null;
//        this.xAxis = null;
//        this.yAxis = null;
//        this.svg = null;
//        this.bar = null;
//        this.marginLeft = marginLeft;
//        this.made = false;
    };

    // graphs one and two
    var chart = new chartParams('#chart', 'GIN'); 

    parent.chart = {
        
        init : function(data) {
            
            if(chart.made) {
                app.chart.updateChart(data, chart);
            } else {
                app.chart.drawChart(data, chart);
            }    
        },
        parseData: function (countriesData, currentIso) {
        
        
            var countryData = [];
            
            for(var vaccine in countriesData[currentIso]) {
                
                var valuesArray = [];

                for (var timestamp in countriesData[currentIso][vaccine]) {

                    if (Number(countriesData[currentIso][vaccine][timestamp])) {

                        valuesArray.push({
                            year: parseTime(timestamp),
                            percentage: Number(countriesData[currentIso][vaccine][timestamp])
                        });
                    }
                }

                if (valuesArray.length > 0) {
                    countryData.push({
                        id: vaccine,
                        values: valuesArray
                    });
                }
            }
            el.countryData = countryData;
            return countryData;
        },
        drawChart: function (data, chart) {
       
            var countryData = app.chart.parseData(data, chart.iso)
          
            var x = d3.scaleTime().range([0, width])
                .domain([parseTime(1980), parseTime(2015)]),
                y = d3.scaleLinear().range([height, 0])
                .domain([
                    d3.min(countryData, function (c) {
                        return d3.min(c.values, function (d) {
                            return d.percentage;
                        })
                    }),
                    d3.max(countryData, function (c) {
                        return d3.max(c.values, function (d) {
                            return d.percentage;
                        })
                    })
              ]),
                z = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(countryData.map(function (c) {
                    return c.id;
                }));

             var line = d3.line()
                .curve(d3.curveBasis)
                .x(function (d) {
                    return x(d.year);
                })
                .y(function (d) {
                    return y(d.percentage);
                });
            
              var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
                .attr("d", function (d) {
                    return line(d.values);
                })
                .style("stroke", function (d) {
                    return z(d.id);
                });

            vaccines.append("text")
                .datum(function (d) {
                    return {
                        id: d.id,
                        value: d.values[d.values.length - 1]
                    };
                })
                .attr("transform", function (d) {
                    return "translate(" + x(d.value.year) + "," + y(d.value.percentage) + ")";
                })
                .attr("x", 3)
                .attr("dy", "0.35em")
                .style("font", "10px sans-serif")
                .text(function (d) {
                    return d.id;
                });

        },
        updateChart(data, chart) {
            
        }

    }



    return parent;

})(app || {}, d3)