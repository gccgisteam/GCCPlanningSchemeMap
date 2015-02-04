#BootLeaf_GS


Author: Alex Leith

Original by Bryan McBride


A feeble attempt to load arbitary GeoServer layers in a pretty interface for fast viewing. It's basically working though, which is nice.

##Notes
Here's what you need to do to get it working for your GeoServer:

1. ensure that you have a reverse proxy and cross origin (for nginx add add_header Access-Control-Allow-Origin *; to allow everywhere)
2. set up a URL using GitHub.io like this: http://alexgleith.github.io/bootleaf_gs/?https://maps.gcc.tas.gov.au/geoserver/GCC_cc/ows

That's it!

It also supports adding initial layers, like this: http://alexgleith.github.io/bootleaf_gs/?https://maps.gcc.tas.gov.au/geoserver/GCC_cc/ows&layers=Stormwaterpipes with a comma separated list.

There are a bunch of configurable components, all at the top of app.js.


##TODO

1. Refactor some of the variables to be sources from the WMS GetCapabilities request.
2. Find some nice way to handle basemaps that are customisable
3. Ensure that the project is easy to copy!
4. Perhaps there's a more elegant way to display information from selected features... Using a modal, perhaps? Or a slide-up or -out...
5. Store added layers after a hash, make it shareable.