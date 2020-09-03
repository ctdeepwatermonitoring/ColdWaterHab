// initialize the map and add slippy maps and layer control options

  //Load a tile layer base map from USGS ESRI tile server https://viewer.nationalmap.gov/help/HowTo.htm
var hydro = L.esri.tiledMapLayer({url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroCached/MapServer"}),
    topo = L.esri.tiledMapLayer({url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer"});
    esriTopo = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
      });

var baseMaps = {
    "NHD": hydro,
    "USGS Topo": topo,
    "ESRI World Topo":esriTopo
  };

var map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    layers:[hydro]
});

var lat= 41.55;
var lng= -72.65;
var zoom= 9;
map.setView([lat, lng], zoom);
map.createPane('top');
map.getPane('top').style.zIndex=650;
L.control.attribution({position: 'bottomleft'}).addTo(map);
L.control.zoom({position:'topright'}).addTo(map);
layerControl = L.control.layers(baseMaps,null).addTo(map);  //add layer control

//Set styles for cold water data and load data into the map
var polystyle = {"color": "#045a8d","weight": 2,"opacity": 0.8}; //Style for drainage
var customOptions = {'maxWidth': '500','className' : 'custom'}; //Set Custom Options for the popUP

$.getJSON("data/coldwatersites_us_drainage.geojson",function(polyData){
    console.log(polyData);
    L.geoJson(polyData,{
        style:polystyle
    }).addTo(map);
});

// load GeoJSON from an external file and display circle markers
$.getJSON("data/coldwatersites.geojson",function(data){
  var marker = L.geoJson(data, {
    pointToLayer: function(feature,latlng){
      var markerStyle = {
        fillColor:'#ff6d6d',
        radius: 5,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9,
        pane: 'top'
      };
      return L.circleMarker(latlng, markerStyle);
    },
    onEachFeature: function (feature,marker) {
      marker.bindPopup('<b>Stream: </b>'+
          feature.properties.Station_Na+'</br>'
          +"<b>SID: </b>"+feature.properties.STA_SEQ+'</br>'+
      "<b>Temperature Logger Year Count: </b>"+feature.properties.TEMP
          +'</br>'+ "<b>Fish Sample Year Count: </b>"
          +feature.properties.FISH+'</br>'+
      '<a href="https://ctdeepwatermonitoring.github.io/ColdWaterHab/data.html" </a> Link to Data',customOptions);
    }
    }).addTo(map);
  });

//Set styles and load boundary and basin data.  Add basin layers to layer control
var linestyle = {
    "color": "black",
    "weight": 2,
};

$.getJSON("data/CT_state_boundary.geojson",function(linedata){
    console.log(linedata);
    L.geoJson(linedata,{
        style:linestyle
    }).addTo(map);
});

var regBasin = L.esri.dynamicMapLayer({url: "https://cteco.uconn.edu/ctmaps/rest/services/Watersheds/Regional_Basins/MapServer"});
layerControl.addOverlay(regBasin,"Regional Basin Layer")
var subBasin = L.esri.dynamicMapLayer({url: "https://cteco.uconn.edu/ctmaps/rest/services/Watersheds/Subregional_Basins/MapServer"});
layerControl.addOverlay(subBasin,"Subregional Basin Layer")

//add legend to map

var legend = L.control({position: 'topleft'});
// Function that runs when legend is added to map
legend.onAdd = function (map) {
  // Create Div Element and Populate it with HTML
  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML += '<p class="title">Data As Of 04-15-20</p>';
  div.innerHTML += '<i class="circle"></i><p> Cold Water Sites - Click for info</p>';
  div.innerHTML += '<i class="poly"></i><p>Supporting Drainage Basin</p>';
  // Return the Legend div containing the HTML content
  return div;
};
// Add Legend to Map
legend.addTo(map);

    
