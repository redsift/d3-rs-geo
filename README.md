# d3-rs-geo

`d3-rs-geo` presents a TopoJSON map in an SVG container.

## Builds

[![Circle CI](https://img.shields.io/circleci/project/redsift/d3-rs-geo.svg?style=flat-square)](https://circleci.com/gh/redsift/d3-rs-geo)
[![npm](https://img.shields.io/npm/v/@redsift/d3-rs-geo.svg?style=flat-square)](https://www.npmjs.com/package/@redsift/d3-rs-geo)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/redsift/d3-rs-geo/master/LICENSE)

## Example

[View @redsift/d3-rs-geo on Codepen](http://codepen.io/collection/nGqPYd/)

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

Property|Description|Transition|
----|-----------|----------|
`classed`| *String* SVG custom class. |N|
`width`, `height`, `size`, `scale`|*Integer* SVG container sizes. |Y|
`background`| *String* Change the colour of the SVG background. |Y|
`theme`| *String* Change the graph theme, includes `'light'`(default) and `'dark'`. |Y| 
`margin`| *Number* Change the margin inside of the SVG container. |Y|
`graticule`| *Number* Opacity of the graticule (line grid). Range between 0 and 1. |N|
`projection`| *String* Change projection view of the world map. `Default` set to [`geoPatterson`](http://map-projections.net/patterson.php). The available world projection can be on found the [D3 geo library github webpage.](https://github.com/d3/d3-geo/blob/master/README.md#geoAlbers)|Y|
`projectionScale`| *Number* Change the projection scale of the world map. |Y| 
`interrupted`| *Boolean* Enabled clipping for interrupted projections. `Default` set to `true`.|N|
`geometry` | *String* Set the country geometry Parameters `land`;display the entire country geometry , `states`; display each state of the country, `countries`; display each countries.|N|  
`fill`| *String* Change the land filling colour. Parameter `colour name`, `rgb colour` or `hex colour`.|Y|
`points`| *(Array of)Number* Add points on the map using decimal expression of [ `Longitude`, `Latitude` ].|N|
`pointsDisplay`| *Function, String* Supply custom [symbol](https://github.com/d3/d3-shape#symbol) of the plotted points i.e. object that implements a `draw` function or supply a totally custom reusable component via the pointDisplay property. `Default` set to `symbolWye`*|N|
`links`| *(Array of)Number* Links each points. Parameter include an arrays of points connecting the link.|Y|
`linksDisplay`| *Function, String* Supply custom presentation to the dashed line. ||
`zoom`| *Number* Zoom into the map. `Default` set to `1.0`.|Y|
`zoomX`, `zoomY`| *Number* Zoom into the map at x-coordinate (zoomX) and Y-coordinate (zoomY). |Y| 
`onClick`| *Function* Handler for a click event on a data series. |N|