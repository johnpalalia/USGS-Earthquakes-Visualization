
    
//  Satelite tile layer
var satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/gnnj/cjf2pd6vl22122so5on7z1d23/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoiZ25uaiIsImEiOiJjamYycGI2emIwNDliMnFwNHV5aWc4dHVzIn0.HuNjOtK4ppcfYmbJnp0uFA'
});

//  Light Layer
var lightMap = L.tileLayer('https://api.mapbox.com/styles/v1/gnnj/cjf2qs3vc27602smr3svca219/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ25uaiIsImEiOiJjamVqNmkxbWIwazk5MzNudW4wemJzZTJoIn0.yz4oXpqHFx-jWUOVAvqoKw',
    {maxZoom: 18});

// Outdoors layer
var outdoorsMap = L.tileLayer('https://api.mapbox.com/styles/v1/gnnj/cjf2qon3u27ce2soaesqdlvnd/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ25uaiIsImEiOiJjamVqNmkxbWIwazk5MzNudW4wemJzZTJoIn0.yz4oXpqHFx-jWUOVAvqoKw')


// Quake data link
var quakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Fault lines data link
var faultLinesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

d3.json(quakeLink, function(data){
   var quakeFeatures = data.features

   console.log(quakeFeatures)
 
   var quakes = L.geoJSON(quakeFeatures, {
    pointToLayer: function (feature, latlng) {
        return new L.circle(latlng, 
            {radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            fillOpacity: .7,
            stroke: true,
            color: "black",
            weight: .5

        })
        },
    onEachFeature: function (feature, layer){
        layer.bindPopup(feature.properties.place + "<br> Magnitude: " + feature.properties.mag)
    }
    });

 

    d3.json(faultLinesLink, function(data){
        
        var faultFeatures = data.features

        var styling = {
            "fillOpacity": 0
        }

        console.log(faultFeatures)
        var faults = L.geoJSON(faultFeatures, {
            style: function(feature){
                return styling
            }
        })


        createMap(quakes, faults)
    })

    
});

function getColor(d) {
    return d > 5  ? '#E31A1C' :
           d > 4  ? '#FC4E2A' :
           d > 3   ? '#FD8D3C' :
           d > 2   ? '#FEB24C' :
           d > 1   ? '#FED976' :
                      '#FFEDA0';
}

function getRadius(value){
    return value*50000
}

console.log("made it here")

function createMap(quakeLayer, faultLayer){
   var baseMaps = {
    "Outdoor Map": outdoorsMap,
    "Grayscale Map": lightMap,
    "Satelite Map": satelliteMap
  };

var overlayMaps = {
    "Earthquakes": quakeLayer,
    "Fault Lines": faultLayer
    
  };
var mymap = L.map('mapid', {
    center: [42.877742, -97.380979],
    zoom: 2.5,
    minZoom: 2.5,
    layers: [lightMap, faultLayer, quakeLayer],
    maxBounds: L.latLngBounds([90, -180], [-90, 180]),
    maxBoundsViscosity: 1,
    scrollWheelZoom: false
    
}); 

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (mymap) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    div.innerHTML += '<p><u>Magnitude</u></p>'

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(mymap);

L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(mymap);
}

