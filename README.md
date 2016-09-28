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
`interrupted`| Enabled clipping for interrupted projections
`country`|*Boolean* enable country polygons
`fill`| Land filling
`points`| Decimal expression of [ Longitude, Latitude ]
`pointsDisplay`|
`links`|
`linksDisplay`|
`zoom`|
`zoomX`, `zoomY`|
`onClick`|