var app = (function(parent, d3){
 

  var el = parent.el;


  parent.map = {

    init : function(world) {
			
	  var width = d3.select("#map").style("width").slice(0,-2),
		  height = d3.select("#map").style("height").slice(0,-2);
		
	  var svg = d3.select("#map svg")
	  	  .attr("width", width)
	  	  .attr("height", height);

//	  var projection = d3.geoInterrupt(d3.geoSinusoidalRaw,
//		  [[ // northern hemisphere
//              [[-180,   0], [-100,  90], [ -40,   0]],
//              [[ -40,   0], [  30,  90], [ 180,   0]]
//            ], [ // southern hemisphere
//              [[-180,   0], [-160, -90], [-100,   0]],
//              [[-100,   0], [ -60, -90], [ -20,   0]],
//              [[ -20,   0], [  20, -90], [  80,   0]],
//              [[  80,   0], [ 140, -90], [ 180,   0]]
//            ]])
//		.rotate([0, 0])
//		.scale(120)
//		.translate([width / 2, height / 2])
//		.precision(0.1);
        
        var projection = d3.geoCylindricalStereographic()
            .scale(140)
            .translate([width / 2, height / 2 + 50])
            .rotate([0, 0, 0])
            .precision(0.1);
		
		var graticule = d3.geoGraticule();

		var path = d3.geoPath()
			.projection(projection);

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
		
		  svg.selectAll("path")
			  .data(topojson.feature(world, world.objects.countries).features)
		  	  .enter()
		  	  .append("path")
			  .attr("class", "country")
			  .attr("clip-path", "url(#clip)")
			  .attr("d", path)
              .on('mouseover', function(d) {
                    app.map.highLightCountry(d.properties.iso);
                    app.chart.updateChart(d.properties.iso);
                });
        
            app.map.highLightCountry('AFG')
    
        },
        highLightCountry : function(iso) {

            d3.selectAll('.country')
                .attr('fill', function(d) {
                    if(d.properties.iso == iso) {
                        return 'yellow';
                    } else {
                        return '#888';
                    }
                })   
        }
        
      
  }
  
  return parent;
    
})(app || {}, d3)
  