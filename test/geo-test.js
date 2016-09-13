var tape = require("@redsift/tape-reel")("<div id='test'></div>"),
    d3 = require("d3-selection"),
    lines = require("../");

// This test should be on all brick compatable charts
tape("html() empty state", function(t) {
    var host = lines.html();
    var el = d3.select('#test');
    el.call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    // should have an X and Y major and minor axis
    t.equal(el.selectAll('g.axis').size(), 4);
        
    t.end();
});


tape("html() 1 line state", function(t) {
    var host = lines.html();
    var el = d3.select('#test');
    el.datum([ 1, 2 ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    var node = el.select(host.self());
        
    // In this chart, one path should be there
    t.equal(node.selectAll('path.stroke').size(), 1);
    t.equal(node.selectAll('path.area').size(), 1);
        
    t.end();
});


tape("html() 2 line state", function(t) {
    var host = lines.html();
    var el = d3.select('#test');
    el.datum([ [ 0, 1 ], [ 1,  2 ] ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    var node = el.select(host.self());
        
    // In this chart, one path should be there
    t.equal(node.selectAll('path.stroke').size(), 2);
    t.equal(node.selectAll('path.area').size(), 2);

    t.equal(node.selectAll('.voronoi path.series-0').size(), 2);
    t.equal(node.selectAll('.voronoi path.series-1').size(), 2);
            
    t.end();
});

[ null, 'top', 'left' , 'right', 'bottom', 'voronoi' ].forEach(function (o) {

    tape("html() data reentrant", function(t) {
        var data = [ [ 0, 1 ], [ 1,  2 ] ];
        
        var host = lines.html();
        if (o != null) {
            host.legendOrientation(o);
        }

        var el = d3.select('#test');
        el.datum(data).call(host);
        
        t.equal(el.selectAll('svg').size(), 1);
        
        var initial = el.selectAll('*').size();
        
        el.datum(data).call(host);
        
        t.equal(initial, el.selectAll('*').size());
            
        t.end();
    });
    
});

tape("html() voronoi updates", function(t) {
    var host = lines.html().legendOrientation('voronoi');

    var el = d3.select('#test');
    el.datum([ [ 0, 1 ], [ 1,  2 ] ]).call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    t.equal(el.selectAll('.voronoi path').size(), 4, '4 voronoi polygons');
    t.equal(el.selectAll('.voronoi text').size(), 2, '2 text labels');
    
    el.datum([ [ 0, 1 ] ]).call(host);
    
    t.equal(el.selectAll('.voronoi path').size(), 2, '2 voronoi polygons');
    t.equal(el.selectAll('.voronoi text').size(), 1, '1 text label');
        
    t.end();
});
