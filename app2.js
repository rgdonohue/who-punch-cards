// app.el.js
var app = (function(parent, w, d, d3) {

  // "el" is just an object we store our "public" variables in 
  // so we can pass them between modules
  parent.el = {
    baselayer : new L.StamenTileLayer("toner-lite"),
    sql : new cartodb.SQL({ user: 'chenrick' }),
    taxLots : "nyc_flips_pluto_150712",
    url : w.location.href,
    hashurl : null,
    map : null,
    layerSource : null,
    cdbOptions : null,
    dataLayer : null,
    queriedData: null,
    sum: null,
    tax: null,
    cartocss : null,
    featGroup : null,
    bounds : null,
    center : null,
    topPoint : null,
    centerPoint : null
  };

  return parent;

})(app || {}, window, d3);