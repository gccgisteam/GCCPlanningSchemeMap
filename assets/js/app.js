$(document).on("click", ".feature-row", function(e) {
  sidebarClick(parseInt($(this).attr('id')),layerControl);
});

$("#full-extent-btn").click(function() {
  map.setView(startCenter, startZoom);
  return false;
});

$("#legend-btn").click(function() {
  //TODO: add all the currently added layers here, not just one...
  var text = "";
  if(currentBaseLayer) {
    text += "<b>" + featureLayersName[currentLayerIndex] + "</b><br><img src=https://maps.gcc.tas.gov.au/geoserver/ows?service=wms&request=getlegendgraphic&layer=" + featureLayers[currentLayerIndex] + "&format=image/png&LEGEND_OPTIONS=forceLabels:on><br>";
  }
  $("#legend").html(text);
  $('#legendModal').modal('show');
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});

$('#search-form').submit(function(e) {
    alert("Working....");
});

var map, featureLayers = [], featureLayersName = [];

//Native projection from GeoServer WFS
var src = new Proj4js.Proj('EPSG:4326');
var dst = new Proj4js.Proj('EPSG:28355');

//Attribution, get from WMS?
var layerAttribution = 'Data &copy <a href=http://maps.gcc.tas.gov.au>GCC</a>, Data to be used for Council related purposes only.';


var startCenter = new L.LatLng(-42.8232,147.2555);
var startZoom = 12;
var searchBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-42.9063,147.1335),
    new google.maps.LatLng(-42.7167, 147.3444));

owsURL = "https://maps.gcc.tas.gov.au/geoserver/ows";
wmsURL = "https://maps.gcc.tas.gov.au/geoserver/gwc/service/wms";

var PScheme_BaseLabels = new L.TileLayer.WMS(wmsURL, {
        layers: 'gcc_ips:PScheme_BaseLabels',
        format: 'image/png',
        transparent: true,
        maxZoom: 20,
        attribution: 'Base data from <a href=http://www.thelist.tas.gov.au>the LIST</a>, &copy State of Tasmania.'
    });

var image = new L.tileLayer("https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/Orthophoto/ImageServer/tile/{z}/{y}/{x}", {
    attribution: "Base Imagery from <a href=http://www.thelist.tas.gov.au>the LIST</a> &copy State of Tasmania",
    maxZoom: 20,
    maxNativeZoom: 19,
    opacity: 0.6,
    transparent: true
});

var ps = new L.TileLayer.WMS(wmsURL, {
    layers: 'gcc_ips:Pscheme_ZoningGroup',
    format: 'image/png',
    transparent: true,
    maxZoom: 20,
    attribution: layerAttribution
});

var ie = L.Browser.ie;

var baseLayers = {
  'Zoning': ps
};

var overlays = {
    "Aerial Image": image,
    "Labels and Boundaries": PScheme_BaseLabels
};

var overlaysList = {
    "E3 Landslide Code": 'PScheme_Oly_Landslide',
    "E8 Electricity Transmission Infrastructure Protection Code": 'PScheme_Oly_ElecTransInfraProtection',
    "E10 Biodiversity Code": 'PScheme_Oly_Biodiversity',
    "E11 Waterway and Coastal Protection Code": 'PScheme_Oly_WaterwayCoastalProtection',
    "E14 Scenic Landscapes Code": 'PScheme_Oly_ScenicLandscapes',
    "E15 Inundation Prone Areas Code": 'PScheme_Oly_InundationProneAreas',
    "E16 Coastal Erosion Hazard Code": 'PScheme_Oly_CoastalErosionHazard',
    "E20 Acid Sulfate Soils Code": 'PScheme_Oly_AcidSulfateSoils',
    "E21 Dispersive Soils Code": 'PScheme_Oly_DispersiveSoils',
    "E24 Significant Trees Code": 'PScheme_Oly_SignificantTrees',
    "F Specific Area Plans": 'PScheme_SpecificAreaPlans'
};

var referenceLayersList = {
  "E9.0 Attenuation Reference": 'Pscheme_Ref_Attenuation',
  "E13.0 Heritage Reference": 'Pscheme_Ref_Heritage',
  "E10.0 Priority Biodiversity Values Reference": 'PScheme_Ref_PriorityBiodiversityValues',
  "E15.0 Riverine Hazard Reference": 'Pscheme_Ref_RiverineHazard',
  "Title Reference": 'PScheme_Ref_Title',
  "F3 Wellington Park Reference": 'PScheme_Ref_WellingtonPark'
}

var layerIndex = 1;

//Add zoning to list
$("#feature-list tbody").append('<tr class="feature-row" id="'+0+'">\
    <td style="vertical-align: middle;"><i class="fa fa-area-chart"></i></td><td class="feature-name">Zoning</td>\
    <td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
featureLayers.push("gcc_ips:Pscheme_ZoningGroup")
featureLayersName.push('Zoning')

for (layer in overlaysList) {
  featureLayers.push("gcc_ips:"+overlaysList[layer])
  featureLayersName.push(layer)
  $("#feature-list tbody").append('<tr class="feature-row" id="'+layerIndex+'">\
    <td style="vertical-align: middle;"><i class="fa fa-bars"></i></td><td class="feature-name">'+layer+'</td>\
    <td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
  layerIndex = layerIndex + 1;
};

for (layer in referenceLayersList) {
  featureLayers.push("gcc_ips:"+referenceLayersList[layer])
  featureLayersName.push(layer)
  $("#feature-list tbody").append('<tr class="feature-row" id="'+layerIndex+'">\
    <td style="vertical-align: middle;"><i class="fa fa-ellipsis-h"></i></td><td class="feature-name">'+layer+'</td>\
    <td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
  layerIndex = layerIndex + 1;
};

//this is where I add the layer. Primed with Zoning.
var currentBaseLayer = ps;
var currentLayerIndex = 0;

function sidebarClick(id) {
  if(currentBaseLayer) {
    map.removeLayer(currentBaseLayer);
  }
  currentLayerIndex = id;
  //TODO: change this to remove other layers.
  addLayer(featureLayers[id]);
}

function addLayer(layer) {
  var id = $.inArray(layer, featureLayers);
  if(id === -1) {
    return;
  }
  var newLayer = new L.TileLayer.WMS(wmsURL + "?SERVICE=WMS&", {
          layers: layer,
          format: 'image/png',
          transparent: true,
          maxZoom: 20,
          attribution: layerAttribution
  });

  currentBaseLayer = newLayer;

  map.removeControl(layerControl);
  baseLayers = {}  
  baseLayers[featureLayersName[id]] = newLayer;
  layerControl = L.control.layers(baseLayers, overlays, {
    collapsed: isCollapsed
  }).addTo(map);

  map.addLayer(newLayer);
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

map = L.map("map", {
  zoom: startZoom,
  center: startCenter,
  layers: [PScheme_BaseLabels],
  zoomControl: false,
  attributionControl: false
});

//Start with Zoning.
map.addLayer(ps);

//Query layer functionality.
var selectedFeature;
var queryCoordinates;

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        fillColor: "yellow",
        color: "yellow",
        weight: 5,
        opacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    var layer = e.target;
    layer.setStyle({
        radius: 5,
        fillColor: "yellow",
        color: "yellow",
        weight: 5,
        opacity: 0.6,
        fillOpacity: 0.2
    });
}

function handleJson(data) {
  if (selectedFeature) {
    map.removeLayer(selectedFeature);
  };
  selectedFeature = L.geoJson(data, {
    style: function (feature) {
        return {color: 'blue'};
    },
    onEachFeature: function (feature, layer) {
	var head = '<table class="table table-striped table-condensed table-bordered">'
		+'<tr><td><b>Address</b></td><td>'+((feature.properties.address) ? feature.properties.address : "")+'</td></tr>'
		+'<tr><td><b>PID</b></td><td>'+((feature.properties.pid != -9999) ? feature.properties.pid : "")+'</td></tr>'
		+'<tr><td><b>Zones</b></td><td>'+feature.properties.zones+'</td></tr>';
	var mid = '<tr><td><b>Zone Boundary</b></td><td>'+((feature.properties.zonebdy) ? feature.properties.zonebdy : "none")+'</td></tr>';
	var tail = '<tr><td><b>Overlays</b></td><td>'+((feature.properties.overlays) ? feature.properties.overlays : "none")+'</td></tr>'
		+'<tr><td><b>Reference Layers</b></td><td>'+((feature.properties.reflayers) ? feature.properties.reflayers : "")+'</td></tr>'
		+'<tr><td><b>Note</b></td><td>Other codes may be triggered by description, refer to "Application" section in each code.</td></tr>'
		+'</table>';
	if (feature.properties.zonebdy) {
		var content = head + mid + tail;
	} else { var content = head + tail;}
	
    var popup = L.popup()
        .setLatLng(queryCoordinates)
        .setContent(content)
        .openOn(map);
        layer.bindPopup(content);
    queryAddress = feature.properties.address;
    }
  });
  selectedFeature.addTo(map);
}

map.on('click', function(e) {        
  var p = new Proj4js.Point(e.latlng.lng,e.latlng.lat);
  Proj4js.transform(src, dst, p);
  queryCoordinates = e.latlng
  
  var defaultParameters = {
    service : 'WFS',
    version : '1.1.1',
    request : 'GetFeature',
    typeName : 'gcc_ips:PScheme_Summary',
    maxFeatures : 100,
    outputFormat : 'text/javascript',
    format_options : 'callback:getJson',
    SrsName : 'EPSG:4326'
  };

  var customParams = {
    //bbox : map.getBounds().toBBoxString(),
    cql_filter:'CONTAINS(geom, POINT(' + p.x + ' ' + p.y + '))'
  };

  var parameters = L.Util.extend(defaultParameters, customParams);

  //console.log(owsURL+L.Util.getParamString(parameters));

  $.ajax({
      url : owsURL + L.Util.getParamString(parameters),
      dataType : 'jsonp',
      jsonpCallback : 'getJson',
      success : handleJson
  });
});

/* Attribution control */
function updateAttribution(e) {
  var attributiontext = "";
  var attributions = []
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      if($.inArray(layer.getAttribution(), attributions) === -1) {
        attributiontext = attributiontext + layer.getAttribution() + '<br>'
        attributions.push(layer.getAttribution())
      }
    }
  });
  $("#attribution").html((attributiontext));
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});

attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://agl.pw'>agl</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Dataset Attribution</a>";
  return div;
};

map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "topleft"
}).addTo(map);

L.control.locate({
  position: 'bottomright',  
  drawCircle: false,
  follow: true
}).addTo(map);

//Ok, got to get the searching working...
$(document).ready(function () {
    (function ($) {
        $('#layerfilter').keyup(function () {
            var rex = new RegExp($(this).val(), 'i');
            $('.searchable tr').hide();
            $('.searchable tr').filter(function () {
                return rex.test($(this).text());
            }).show();
        })
    }(jQuery));
});
$("#searchclear").click(function(){
    $("#layerfilter").val('');
    $('.searchable tr').show();
});

var options = {
  bounds: searchBounds
};
var searchinput = document.getElementById("searchbox");
var autocomplete = new google.maps.places.Autocomplete(searchinput, options);
var leafMarker;
google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      input.className = 'notfound';
      return;
    }
    if(leafMarker){
        map.removeLayer(leafMarker);
    }
    var leafLocation = new L.LatLng(place.geometry.location.lat(),place.geometry.location.lng())
    leafMarker = L.marker(leafLocation, {title: place.formatted_address}).bindPopup(place.formatted_address).addTo(map);
    map.setView(leafLocation, 18)
});

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var layerControl = L.control.layers(baseLayers, overlays, {
    collapsed: isCollapsed
  }).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});
$("#loading").hide();

