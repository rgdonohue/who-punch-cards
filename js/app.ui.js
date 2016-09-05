var app = (function (parent, w, d, d3) {
  // handles UI calculations

  var el = parent.el;

  parent.ui = {

	  init : function(data) {
          
          app.ui.buildDropDown(data);
         
      },
      buildDropDown : function(data) {
         var isoCodes = Object.keys(data);
          
         var select = d3.select('#select-country')
            .selectAll('option')
            .data(isoCodes)
            .enter()
            .append('option')
            .attr('class', function(d) {
                return d;
            })
            .html(function(d) {
                return d;
            })
          
            app.ui.setListeners(isoCodes);
      },
      setListeners : function(isoCodes) {
          
        var select = d3.select("#select-country"),
            options = select.selectAll('option').data(isoCodes);

        select.on('change', function(d) {
           var si   = select.property('selectedIndex')
                s   = options.filter(function (d, i) { return i === si }),
                iso = s.datum();
  
            app.chart.updateChart(iso);
            app.map.highLightCountry(iso);
         });
          
          
      }

  }; // end parent.ui object

  return parent;

})(app || {}, window, document, d3);