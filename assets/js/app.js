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
    text += "<b>" + featureLayersName[currentLayerIndex] + "</b><br><img src=https://maps.gcc.tas.gov.au/geoserver/ows?service=wms&request=getlegendgraphic&layer=" + featureLayers[currentLayerIndex] + "&format=image/png><br>";
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
var layerAttribution = 'Data &copy <a href=http://maps.gcc.tas.gov.au>GCC</a>, <a href="https://maps.gcc.tas.gov.au/licensing.html">CC-BY</a>';


var startCenter = new L.LatLng(-42.8232,147.2555);
var startZoom = 12;
var searchBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-42.9063,147.1335),
    new google.maps.LatLng(-42.7167, 147.3444));

owsURL = "https://maps.gcc.tas.gov.au/geoserver/ows";
wmsURL = "https://maps.gcc.tas.gov.au/geoserver/gwc/service/wms";

var ps_baseLabels = new L.TileLayer.WMS(wmsURL, {
        layers: 'gcc_ips:gips_baselayers',
        format: 'image/png',
        transparent: true,
        maxZoom: 20,
        attribution: layerAttribution
    });

var image = new L.tileLayer("https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/Orthophoto/ImageServer/tile/{z}/{y}/{x}", {
    attribution: "Base Imagery from <a href=http://www.thelist.tas.gov.au>the LIST</a> &copy State of Tasmania",
    maxZoom: 20,
    maxNativeZoom: 19,
    opacity: 0.6,
    transparent: true
});

var ps = new L.TileLayer.WMS(wmsURL, {
    layers: 'gcc_ips:gips_zoning',
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
    "Labels and Boundaries": ps_baseLabels
};

var overlaysList = {
    "E3 Landslide Code": 'LDS_Landslide_Glenorchy',
    "E8 Electricity Transmission Infrastructure Protection Code": 'ETP_ElecTranInfraProtection_Glenorchy',
    "E10 Biodiversity Code": 'NAT_Biodiversity_Glenorchy',
    "E11(a) Waterway and Coastal Protection Code": 'WAT_WaterwayCoastProtection_Glenorchy',
    "E11(b) Waterway and Coastal Protection Code": 'REF_CoastRefugia_Glenorchy',
    "E14 Scenic Landscapes Code": 'SCN_ScenicManagement_Glenorchy',
    "E15 Inundation Prone Areas Code": 'FLD_FloodProne_Glenorchy',
    "E16 Coastal Erosion Hazard Code": 'CST_CoastErosion_Glenorchy',
    "E20 Acid Sulfate Soils Code": 'ASS_CoastAcidSulf_Glenorchy',
    "E21 Dispersive Soils Code": 'DSP_DispersiveSoil_Glenorchy',
    "E24 Significant Trees Code": 'TRE_SignificantTrees_Glenorchy',
    "E25 Streetscape Character Code": 'SSC_StreetscapeChar_Glenorchy',
    "F Specific Area Plans": 'SAP_Glenorchy'
};

var referenceLayersList = {
  "example": 'layer'
}

var layerIndex = 1;

//Add zoning to list
$("#feature-list tbody").append('<tr class="feature-row" id="'+0+'">\
    <td style="vertical-align: middle;"><i class="fa fa-area-chart"></i></td><td class="feature-name">Zoning</td>\
    <td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
featureLayers.push("gcc_ips:gips_zoning")
featureLayersName.push('Zoning')

for (layer in overlaysList) {
  featureLayers.push("gcc_ips:"+overlaysList[layer])
  featureLayersName.push(layer)
  $("#feature-list tbody").append('<tr class="feature-row" id="'+layerIndex+'">\
    <td style="vertical-align: middle;"><i class="fa fa-bars"></i></td><td class="feature-name">'+layer+'</td>\
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
  layers: [ps_baseLabels],
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
    var content = "<b>Address:</b> " + ((feature.properties.address) ? feature.properties.address : "")
    + "<br><b>PID:</b> " + ((feature.properties.pid != -9999) ? feature.properties.pid : "")
    + "<br><b>Zones:</b> " + feature.properties.zones
    + "<br><b>Overlays:</b> " + ((feature.properties.overlays) ? feature.properties.overlays : "none")
    + "<br><b>Reference Layers:</b> " + ((feature.properties.refLayers) ? feature.properties.overlays : "none")
    + "<br>Note: Other codes may be triggered by description, refer to &quotApplication&quot section in each code.";
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
    typeName : 'gcc_ips:GlenorchyInterimPlanningScheme',
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

