var app = (function(parent, d3){
 

  var el = parent.el;

  parent.processData = {

    init : function() {
        
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
            .awaitAll(function(e,d) {
                el.countriesTopo = d.shift();
                el.data = d;
            
                var countriesData = {};

                d.map(function(vaccineDatum) {   
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
                        el.countriesTopo.objects.countries.geometries.map(function(country) { 
                            if(country.properties.iso === countryVaccineDatum.ISO_code) {
                                country.properties[countryVaccineDatum.Vaccine] = countryVaccineDatum;   
                            } 
                        });
                    });     
                });

                el.countriesData = countriesData;
                app.chart.init(el.countriesData)
            });
    
    } // end init()
      
  }
  
  return parent;
    
})(app || {}, d3)