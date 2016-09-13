var tape = require("@redsift/tape-reel")("<div id='test'></div>"),
    d3 = require("d3-selection"),
    geo = require("../");

// This test should be on all brick compatable charts
tape("html() empty state", function(t) {
    var host = geo.html();
    var el = d3.select('#test');
    el.call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    // should have an X and Y major and minor axis
    t.equal(el.selectAll('path.graticule').size(), 1);
        
    t.end();
});


