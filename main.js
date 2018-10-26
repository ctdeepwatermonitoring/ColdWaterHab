// initialize the map
var lat= 41.55;
var lng= -72.65;
var zoom= 9;

var map = L.map('map', {
    zoomControl: false,
    attributionControl: false
});

map.setView([lat, lng], zoom);
map.createPane('top');
map.getPane('top').style.zIndex=650;

// load a tile layer base map
L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
}).addTo(map);

L.control.attribution({position: 'topright'}).addTo(map);

//Style for circle markers
function getColor(d){
    var color = '#FFEDAO';
    if(d > 0.75){     color = '#6baed6'; }
    if(d > 0.85){     color = '#3182bd';}
    if(d > 0.999999){ color = '#045a8d';}
    return color;
}

//load GeoJSON poly and display colors based on prob occ Kanno et al 2015
$.getJSON("KannoHighProbCWSCatch.geojson",function(polyData){
    console.log(polyData);
    L.geoJson(polyData,{
        style: function(feature){
            return {
                fillColor: getColor(feature.properties.occProbDat),
                weight: 0.1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.9}
        },
    }).addTo(map);
});


// load GeoJSON from an external file and display circle markers
$.getJSON("coldwaterstreams.geojson",function(data){
  var marker = L.geoJson(data, {
    pointToLayer: function(feature,latlng){
      var markerStyle = {
        fillColor:'#cccccc',
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
      marker.bindPopup('<b>Stream: </b>'+feature.properties.Station_Na+'</br>'+"<b>SID: </b>"+feature.properties.STA_SEQ+'</br>'+
      "<b>Continous Temperature Year Count: </b>"+feature.properties.HOBOCnt+'</br>'+"<b>Fish Sample Year Count: </b>"+feature.properties.FISHCnt);
    }
    }).addTo(map);
  });

//add legend
var legend = L.control({position: 'topleft'});

    // Function that runs when legend is added to map
    legend.onAdd = function (map) {

      // Create Div Element and Populate it with HTML
      var div = L.DomUtil.create('div', 'legend');
      div.innerHTML += '<h4>Available Data Indicating Cold Water Habitat</h4>';
      div.innerHTML += '<i class="circle" style="background: #cccccc"></i><p> Fish and Temperature Cold Water Sites</p>';
      div.innerHTML += '<h5>Occurrence Probability</h5>';
      div.innerHTML += '<i style="background: #045a8d"></i><p>Data Available</p>';
      div.innerHTML += '<i style="background: #3182bd"></i><p>Very High - >0.85 (Kanno et al. 2015) </p>';
      div.innerHTML += '<i style="background: #6baed6"></i><p>High - 0.75 - 0.85 (Kanno et al. 2015)</p>';

      // Return the Legend div containing the HTML content
      return div;
    };

    // Add Legend to Map
    legend.addTo(map);

    // custom zoom bar control that includes a Zoom Home function
L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topright',
        zoomInText: '+',
        zoomInTitle: 'Zoom in',
        zoomOutText: '-',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
        zoomHomeTitle: 'Zoom home'
    },

    onAdd: function (map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
        controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
        controlName + '-home', container, this._zoomHome);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
        controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function (map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function (e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function (e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function (e) {
        map.setView([lat, lng], zoom);
    },

    _createButton: function (html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});
// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);
