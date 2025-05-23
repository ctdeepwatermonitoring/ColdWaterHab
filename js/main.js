// initialize the map and add slippy maps and layer control options
var hydro =     L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroCached/MapServer/tile/{z}/{y}/{x}', 
                  {attribution: 'USGS The National Map: National Hydrography Dataset'});
    topo =      L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
                  {attribution: 'USGS The National Map: National Hydrography Dataset'});
    esriTopo =  L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', 
                  {maxZoom: 18,
                  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'});

var baseMaps = {"NHD": hydro, "USGS Topo": topo, "ESRI World Topo":esriTopo};
var map = L.map('map', {zoomControl: false, attributionControl: false, layers:[hydro]});

var lat  = 41.55;
var lng  = -72.65;
var zoom = 9;
map.setView([lat, lng], zoom);
map.createPane('top');
map.getPane('top').style.zIndex=650;
L.control.attribution({position: 'bottomleft'}).addTo(map);
L.control.zoom({position:'topright'}).addTo(map);
layerControl = L.control.layers(baseMaps,null).addTo(map);  //add layer control

//Set styles for cold water data and load data into the map
var polystyle = {"color": "#00AAE7","weight": 2,"opacity": 0.9}; //Style for drainage
var customOptions = {'maxWidth': '500','className' : 'custom'}; //Set Custom Options for the popUP
var fdate = d3.timeFormat("%m-%d-%Y")


$.getJSON("https://services1.arcgis.com/FjPcSmEFuDYlIdKC/arcgis/rest/services/Cold_Water_Sites_Set/FeatureServer/0?f=pjson",function(metaData){
  console.log(fdate(metaData.editingInfo.dataLastEditDate));


$.getJSON("https://services1.arcgis.com/FjPcSmEFuDYlIdKC/arcgis/rest/services/Cold_Water_Sites_Set/FeatureServer/1/query?outFields=*&where=1%3D1&f=geojson",function(polyData){
    console.log(polyData);
    L.geoJson(polyData,{
        style:polystyle
    }).addTo(map);
});

// load GeoJSON from an external file and display circle markers
$.getJSON("https://services1.arcgis.com/FjPcSmEFuDYlIdKC/arcgis/rest/services/Cold_Water_Sites_Set/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson",function(data){
  var marker = L.geoJson(data, {
    pointToLayer: function(feature,latlng){
      var markerStyle = {
        fillColor:'#FDB515',
        radius: 5,
        color: "#0D2D6C",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
        pane: 'top'
        // fillColor:'#ff6d6d',
        // radius: 5,
        // color: "#000",
        // weight: 1,
        // opacity: 1,
        // fillOpacity: 0.9,
        // pane: 'top'
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
  div.innerHTML += '<i class="circle"></i><p> Cold Water Sites - Click for info</p>';
  div.innerHTML += '<i class="poly"></i><p>Supporting Drainage Basin</p>';
  div.innerHTML += '<p class="dataupdate">Data Last Updated ' + fdate(metaData.editingInfo.dataLastEditDate) + '</p>';
  div.innerHTML += '</br><p class="title">Zoom to Lat/Long</p>'
  div.innerHTML += 'Enter Latitude (Decimal Degrees):<br/><input type="text" name="lat" id="lat" placeholder = "e.g. 41.55" />'
  div.innerHTML += '</br>Enter Longitude (Decimal Degrees):<br/><input type="text" name="long" id="long" placeholder = "e.g. -72.65"/>'
  div.innerHTML += '<br/><input type="button" onclick="zoomToLatLong()" value="zoomToLatLong"/>'
  // Return the Legend div containing the HTML content
  return div;
};
// Add Legend to Map
legend.addTo(map);

 // disable scroll and click functionality
 var lat = L.DomUtil.get("lat") 
 L.DomEvent.disableScrollPropagation(lat);
 L.DomEvent.disableClickPropagation(lat);
 var long = L.DomUtil.get("long") 
 L.DomEvent.disableScrollPropagation(long);
 L.DomEvent.disableClickPropagation(long);

});

function zoomToLatLong() {
  var lat = document.getElementById("lat").value;
  var lng = document.getElementById("long").value;
  console.log([lat,long]);
if (lat == "" || lng == ""){
  map.setView([41.55, -72.65],9);
} else {
  try{
    map.flyTo(new L.LatLng(lat, lng),16);
    if (typeof circle !== 'undefined'){
      map.removeLayer(circle);
      circle = L.circle([lat, lng], {
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 0.5,
        radius: 10
    }).addTo(map)
    } else {
      circle = L.circle([lat, lng], {
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 0.5,
        radius: 10
    })
    circle.addTo(map);
    } 
  } catch (error){
    map.setView([41.55, -72.65],9);
  }
} 
}
    
