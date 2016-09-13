# d3-rs-geo

[![Circle CI](https://img.shields.io/circleci/project/redsift/d3-rs-geo.svg?style=flat-square)](https://circleci.com/gh/redsift/d3-rs-geo)
[![npm](https://img.shields.io/npm/v/@redsift/d3-rs-geo.svg?style=flat-square)](https://www.npmjs.com/package/@redsift/d3-rs-geo)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/redsift/d3-rs-geo/master/LICENSE)

`d3-rs-geo` 

## Example

[View @redsift/d3-rs-geo on Codepen](http://...)

### Line chart

![Sample bars with a bottom orientation](https://bricks.redsift.io/reusable/d3-rs-geo.svg?_datum=[1,200,3100,1000]&orientation=bottom)

### Multiple series

![Sample bars with a left orientation](https://bricks.redsift.io/reusable/d3-rs-geo.svg?_datum=[[1,2,4],[0,1]])

## Usage

### Browser

    <script src="//static.redsift.io/reusable/d3-rs-geo/latest/d3-rs-geo.umd-es2015.min.js"></script>
    <script>
        var chart = d3_rs_geo.html();
        d3.select('body').datum([ 1, 2, 3, 10, 100 ]).call(chart);
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

Topojson data structure or URL

### Points - Custom presentation

The default uses a symbol. You can supply a custom symbol i.e. object that implements a `draw` as per https://github.com/d3/d3-shape#symbol_type or supply a totally custom reusable component.

    let points = [ [ -76.852587, 38.991621, 'NY' ], [ -0.076132, 51.5074, 'London' ] ],
    
    function pointsDisplay(selection) {
        selection.each(function(d, i) {
            let node = select(this).selectAll('text').data([ d ]);
            node = node.enter().append('text').merge(node);
            node.text(d[2]);
        });
    }

### onClick

`d.id` https://en.wikipedia.org/wiki/ISO_3166-1_numeric


### Parameters

Property|Description|Transition|Preview
----|-----------|----------|-------
`classed`|*String* SVG custom class|N
`width`, `height`, `size`, `scale`|*Integer* SVG container sizes|Y|[Pen](...)
`style`|*String* Custom CSS to inject into chart|N
`projection`| http://map-projections.net/patterson.php
`interrupted`| Enabled clipping for interrupted projections
`country`|*Boolean* enable country polygons
`fill`| Land filling
`points`| Decimal expression of [ Longitude, Latitude ]