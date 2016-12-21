# d3-rs-geo

[![Circle CI](https://img.shields.io/circleci/project/redsift/d3-rs-geo.svg?style=flat-square)](https://circleci.com/gh/redsift/d3-rs-geo)
[![npm](https://img.shields.io/npm/v/@redsift/d3-rs-geo.svg?style=flat-square)](https://www.npmjs.com/package/@redsift/d3-rs-geo)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/redsift/d3-rs-geo/master/LICENSE)

`d3-rs-geo` presents a TopoJSON map in an SVG container.

## Example

[View @redsift/d3-rs-geo on Codepen](http://codepen.io/rahulpowar/pen/PGkaxz)

### Flat map

![World map](https://bricks.redsift.io/reusable/d3-rs-geo?_datum={%22url%22:%22https://static.redsift.io/thirdparty/topojson/examples/world-50m.json%22}&offline)

### Map with country coloring and great arcs

![World map with links](https://bricks.redsift.io/reusable/d3-rs-geo?_datum={%22url%22:%22https://static.redsift.io/thirdparty/topojson/examples/world-50m.json%22}&offline)

### Interrupted projection with points of interest

![Interrupted Homolosine projection]()

### USA highlighting states

![USA with states]()

### Stylized Europe

![Funky europe]()

## Usage

### Browser

    <script src="//static.redsift.io/reusable/d3-rs-geo/latest/d3-rs-geo.umd-es2015.min.js"></script>
    <script>
        var chart = d3_rs_geo.html();
        d3.select('body')
            .datum('https://static.redsift.io/thirdparty/topojson/examples/world-50m.json')
            .call(chart);
    </script>

### ES6

    import { html as chart } from "@redsift/d3-rs-geo";
    let eml = chart();
    ...

### Require

    var chart = require("@redsift/d3-rs-geo");
    var eml = chart.html();
    ...

### Datum

Datum can be one of:

1. String representing the URL to load the TopoJSON file for the map from
1. Object representing the TopoJSON itself
1. Object with key `url` (URL to load the TopoJSON file) and optionally the keys `points` and `links`

### Points 

Represents points of interest on the map. `[ [ longitude, latitude ] ... ]`

#### Points - Custom presentation

Default presentation uses a symbol. You can supply a custom symbol i.e. object that implements a `draw` function as per https://github.com/d3/d3-shape#symbol_type or supply a totally custom reusable component via the `pointsDisplay` property.

    // Display a text label instead of the default symbol.
    var points = [ [ -76.852587, 38.991621, 'NY' ], [ -0.076132, 51.5074, 'London' ] ];
    
    function displayText(selection) {
        selection.each(function(d, i) {
            let node = select(this).selectAll('text').data([ d ]);
            node = node.enter().append('text').merge(node);
            node.text(d[2]);
        });
    }
    var chart = d3_rs_geo.html().points(points).pointsDisplay(displayText);
    d3.select('body')
        .datum('https://static.redsift.io/thirdparty/topojson/examples/world-50m.json')
        .call(chart);

### Links

Represents great arcs between two points. `[ [ longitude-1, latitude-1, longitude-2, latitude-2 ] ... ]`

#### Links - Custom presentation

Default presentation uses a dashed line. 
    
    // Display a solid red line
    var links = [ [ -76.852587, 38.991621, -0.076132, 51.5074 ] ];

    function redLine(selection) {
        selection.attr('stroke', 'red').attr('stroke-width', '2px');
    }
    var chart = d3_rs_geo.html().links(links).linksDisplay(redLine);
    d3.select('body')
        .datum('https://static.redsift.io/thirdparty/topojson/examples/world-50m.json')
        .call(chart);

### onClick(d,i,c)

Click handler for map interactions. `d` will be the object of the interaction from the TopoJSON data structure. E.g. if the click was on a country, `d` will be an object and `d.id` will be the [ISO_3166-1 country code](https://en.wikipedia.org/wiki/ISO_3166-1_numeric).

`d` will be null if the click was outside a country boundary.

### Performance checklist

As setup in the examples, the drawing of the map involves a number of heavy operations.

1. Downloading the specified topojson data set.
1. Parsing the data set.
1. Applying the projection to convert the data into paths where the paths represent the landmass and/or the political boundaries of the planet.
1. Performing a standard D3 `enter()/update()/exit()` pattern for the paths.
1. Rendering the additional points and links on the map.

While this is all done relatively efficiently (once the JSON is in the network cache, a 110m world map will compute in ~200ms on a fast desktop), reducing the amount of work that needs to be done will improve performance, reduce energy consumption and free cycles for the rest of the application. You can do this by:

1. Use a topojson that provides the appropriate level of detail for your application. The 50m resolution version of the world `https://static.redsift.io/thirdparty/topojson/examples/world-50m.json` is ~750kb of JSON while the 110 meter resolution version `https://static.redsift.io/thirdparty/topojson/examples/world-110m.json` is ~ 100kb. The 110m version obviously does not capture outlines and smaller islands as accurately.
1. Load the topojson once and parse the parsed javascript object to the chart via the `datum` indead of using the URL reference.
1. Once your map is rendered and you do not intend the change the topology of the map itself, you can supress logic associated with refreshing the paths by setting `redrawTopology` to false e.g. you may use this when updating data points on the same map.

### Parameters

Property|Description|Transition|Preview
----|-----------|----------|-------
`classed`|*String* SVG custom class|N
`width`, `height`, `size`, `scale`|*Integer* SVG container sizes|Y
`background`|
`theme`|
`margin`|
`graticule`|
`projection`| http://map-projections.net/patterson.php
`projectionScale`|
`interrupted`|*Boolean* enabled clipping for interrupted projections
`country`|*Boolean* enable country polygons
`fill`| Land filling
`points`| Decimal expression of [ Longitude, Latitude ]
`pointsDisplay`|
`links`|
`linksDisplay`|
`zoom`|
`zoomX`, `zoomY`|
`onClick`|
`redrawTopology`|*Boolean* When drawing the map, redraw the topology too
`negative`|*String* Color for the negative space in the map i.e. typically the water. When interrupted is set to false, this does not display and the `background` color shows through
`boundary`|*String* Color for the boundaries between country polygons