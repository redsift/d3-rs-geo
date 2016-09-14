import { select, mouse } from 'd3-selection';
import { json } from 'd3-request';
import { geoGraticule, geoPath } from 'd3-geo';
import { symbol, symbolWye } from 'd3-shape';
import { max } from 'd3-array';
import { feature, mesh, neighbors } from 'topojson';

import { 
  geoAlbers,
  geoAlbersUsa,
  geoEquirectangular,
  geoMercator,
  geoOrthographic
} from 'd3-geo';


import {
  geoGuyou,
  geoPatterson,
  geoPeirceQuincuncial,
  geoInterruptedHomolosine,
  geoInterruptedBoggs,
  geoInterruptedMollweideHemispheres
} from 'd3-geo-projection';


const projections = {
  geoAlbersUsa: geoAlbersUsa,
  geoEquirectangular: geoEquirectangular,
  geoAlbers: geoAlbers,
  geoGuyou: geoGuyou,
  geoMercator: geoMercator,
  geoOrthographic: geoOrthographic,
  geoPatterson: geoPatterson,
  geoPeirceQuincuncial: geoPeirceQuincuncial,
  geoInterruptedHomolosine: geoInterruptedHomolosine,
  geoInterruptedBoggs: geoInterruptedBoggs,
  geoInterruptedMollweideHemispheres: geoInterruptedMollweideHemispheres  
};

const projectionsRatios = {
  geoPeirceQuincuncial: { a: 1, s: 4.47613863},
  geoPatterson: { a: 0.5700506757, s: Math.PI * 2 },
  geoMercator: { a: 1, s: Math.PI * 2 },
  geoOrthographic: { a: 1, s: 2 }
}

import { html as svg } from '@redsift/d3-rs-svg';

import { 
  presentation10,
  display,
  fonts,
  widths
} from '@redsift/d3-rs-theme';

const DEFAULT_SIZE = 960;
const DEFAULT_ASPECT = { a: 480 / 960, s: 2*Math.PI };
const DEFAULT_MARGIN = 4;  // white space
const DEFAULT_POINT_SIZE = 24; // size of the point symbol

let INSTANCE = 0;

function coerceArray(d) {
  if (d == null) {
    return [];
  }
  
  if (!Array.isArray(d)) {
      return [ d ];
  }
  
  return d;
}

export default function geo(id) {
  let classed = 'chart-geo', 
      theme = 'light',
      background = undefined,
      width = DEFAULT_SIZE,
      height = null,
      margin = DEFAULT_MARGIN,
      style = undefined,
      scale = 1.0,
      graticule = 0.5,
      projection = 'geoPatterson',
      projectionScale = null,
      interrupted = true,
      country = false,
      fill = null,
      points = null,
      links = null,
      zoom = 1.0,
      zoomX = undefined, 
      zoomY = undefined,
      pointsDisplay = undefined,
      linksDisplay = undefined,
      onClick = null;

  INSTANCE = INSTANCE + 1;

  function _impl(context) {
    let selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);
      
    let _background = background;
    if (_background === undefined) {
      _background = display[theme].background;
    }
    
    let _style = style;
    if (_style === undefined) {
      _style = _impl.defaultStyle(theme, width);
    }

    let projectionAspect = DEFAULT_ASPECT;

    let _projection = projection;
    if (typeof _projection === 'string') {
      projectionAspect = projectionsRatios[_projection] || projectionAspect;
      _projection = projections[_projection];
    }

    let _height = height || Math.round(width * projectionAspect.a);

    function _makeFillFn() {
      let colors = () => fill;
      if (fill == null) {
        //TODO: Should use a custom presentation for this, need at least a presentation8 for world
        let c = presentation10.standard.filter((c,i) => (i !== presentation10.names.yellow && i !== presentation10.names.grey && i !== presentation10.names.brown));
        colors = (d, i, g) => c[(g + presentation10.names.brown) % c.length];
      } else if (typeof fill === 'function') {
        colors = fill;
      } else if (Array.isArray(fill)) {
        colors = (d, i, g) => fill[ g % fill.length ];
      }
      return colors;  
    }  

    let _color = _makeFillFn();

    let _linksDisplay = linksDisplay;
    if (_linksDisplay == undefined) {
      _linksDisplay = function (selection) {
        selection.attr('stroke', presentation10.standard[presentation10.names.yellow])
                  .attr('stroke-width', '2px')
                  .attr('stroke-dasharray', '5,3');
      }
    }

    let _pointsDisplay = pointsDisplay;
    if (_pointsDisplay === undefined) {
      _pointsDisplay = symbolWye;
    }

    if (_pointsDisplay && typeof _pointsDisplay.draw === 'function') {
      let symbolType = _pointsDisplay;
      _pointsDisplay = function (selection) {
        let circle = symbol().type(symbolType).size(DEFAULT_POINT_SIZE);
        selection.each(function(d) {
          let node = select(this).selectAll('path').data([ d ]);
          node = node.enter().append('path').merge(node);
          node.attr('d', () => circle())
                .attr('opacity', 0.9)
                .attr('stroke', '#fff')
                .attr('fill', presentation10.darker[presentation10.names.yellow])
                .attr('pointer-events', 'none')
                .attr('stroke-width', '0.5px');
        });
      }
    }

    selection.each(function() {
      let node = select(this);  
      
      // SVG element
      let sid = null;
      if (id) sid = 'svg-' + id;
      let root = svg(sid).width(width).height(_height).margin(margin).scale(scale).background(_background).style(_style);
      let tnode = node;
      if (transition === true) {
        tnode = node.transition(context);
      }
      tnode.call(root);
      
      let snode = node.select(root.self());
      let elmS = snode.select(root.child());

      let w = root.childWidth(),
          h = root.childHeight();

      let proj = _projection()
                    .scale(projectionScale || (w / projectionAspect.s))
                    .translate([ w / 2, h / 2 ]);

      let path = geoPath().projection(proj);


      let clipPath = `geo-clip-${INSTANCE}`,
          clip = `geo-shape-${INSTANCE}`;

      // Create required elements
      let g = elmS.select(_impl.self())
      if (g.empty()) {
        let defs = snode.select('defs');
        defs.append('path').attr('id', clipPath);
        defs.append('clipPath').attr('id', clip)
            .append("use").attr('xlink:href', `#${clipPath}`);

        g = elmS.append('g').attr('class', classed).attr('id', id);

        g.append('use').attr('class', 'border').attr('pointer-events', 'none');
        g.append('use').attr('class', 'fill').attr('pointer-events', 'none');
        g.append('path').attr('class', 'land');
        g.append('g').attr('class', 'country');
        g.append('path').attr('class', 'boundary');
        g.append('g').attr('class', 'links');
        g.append('g').attr('class', 'points');
        g.append('path').attr('class', 'graticule');
      }

      let tg = g;
      if (transition === true) {
        tg = g.transition(context);
      }

      tg.attr('transform', `scale(${zoom})translate(${zoomX ? Math.round(-zoomX + w/(zoom*2)): 0},${zoomY ? Math.round(-zoomY + h/(zoom*2)) : 0})`);

      if (interrupted) {
        snode.select(`#${clipPath}`).datum({ type: 'Sphere' }).attr('d', path);
        snode.select('use.border').attr('xlink:href', `#${clipPath}`);
        snode.select('use.fill').attr('xlink:href', `#${clipPath}`);
      } else {
        snode.select(`#${clipPath}`).attr('d', null);
        snode.select('use.border').attr('xlink:href', null);
        snode.select('use.fill').attr('xlink:href', null);
      }

      g.select('path.graticule')
        .datum(geoGraticule())
        .attr('clip-path', interrupted ? `url(#${clip})` : null)
        .attr('d', path)
        .attr('stroke-opacity', graticule);

      let data = g.datum() || {};

      let pdata = null;
      if (typeof data === 'string') {
        pdata = new Promise( (ok, ko) => json(data, (e,d) => e ? ko(e) : ok(d) ) );
      } else if (data.url) {
        pdata = new Promise( (ok, ko) => json(data.url, (e,d) => e ? ko(e) : ok(d) ) );
      } else {
        pdata = Promise.resolve(data);
      }

      let _links = links || data.links || [];
      let _points = points || data.points || [];
      
      pdata
      .then(d => {
        let objects = d.objects || {};

        let selectable = null;
        // Landmass
        if (country) {
          let cont = feature(d, objects.countries || {}).features;
          let neig = neighbors(objects.countries.geometries);

          let countries = g.select('g.country').attr('clip-path', interrupted ? `url(#${clip})` : null)
            .selectAll('path')
            .data(cont)
            .enter()
            .append('path');

          // compute g, the greedy constraint color index i.e. no adjacent countries share the same color
          countries.attr('d', path).attr('fill', (d,i) => _color(d, i, (d.color = max(neig[i], n => cont[n].color) + 1 | 0) ));

          g.select('path.land').attr('d', null);

          selectable = countries;
        } else {

          let land = g.select('path.land')
            .datum(feature(d, objects.land || {}))
            .attr('clip-path', interrupted ? `url(#${clip})` : null)
            .attr('fill', (d,i) => _color(d,i,i))
            .attr('d', path);

          g.select('g.country').selectAll('path').attr('d', null);

          selectable = land;
        }

        selectable.on('click', function(d,i) {
          let centroid = null;
          if (d && d.id) {
            centroid = path.centroid(d);
          } else {
            centroid = mouse(this);
          }
          if (onClick) onClick.apply(_impl, [ d, i, centroid ]);
        });

        snode.select('rect.background').on('click', function() {
          if (onClick) onClick.apply(_impl, [ null, -1, mouse(this) ]);
        });

        // Country boundary
        g.select('path.boundary')
          .datum(mesh(d, objects.countries || {}, (a, b) => a !== b))
          .attr('clip-path', interrupted ? `url(#${clip})` : null)
          .attr('d', path);

        // Links
        let arcs = g.select('g.links')
          .selectAll('path')
          .data(_links.map(d => ({ type: 'LineString', coordinates: [ [ d[0], d[1] ], [ d[2], d[3] ] ]})));

         arcs.exit().remove();

         arcs = arcs.enter().append('path')
                      .attr('fill', 'none')
                      .attr('pointer-events', 'none')
                    .merge(arcs);
         arcs.attr('d', path);
                      
         if (_linksDisplay) {
           arcs.call(_linksDisplay);
         }

        // Points
        let pois = g.select('g.points')
          .selectAll('g')
          .data(_points);

         pois.exit().remove();

         pois = pois.enter().append('g').merge(pois);

         pois.attr('transform', d => {
           let p = proj(d);
           return `translate(${p[0]}, ${p[1]})`
         });

         if (_pointsDisplay) {
           pois.call(_pointsDisplay);
         }
      })
      .catch(e => {
        /* eslint-disable no-console */
        console.error('d3-rs-geo error:', e.stack);
        /* eslint-enable no-console */
      });

    });
    
  }
  
  _impl.self = function() { return 'g' + (id ?  '#' + id : '.' + classed); }

  _impl.id = function() {
    return id;
  };

  //TODO: Move pointer events to svg
  _impl.defaultStyle = (_theme, _width) => `
                ${fonts.variable.cssImport} 
                ${_impl.self()} text { 
                                      font-family: ${fonts.variable.family};
                                      font-size: ${fonts.variable.sizeForWidth(_width)};  
                                      font-weight: ${fonts.fixed.weightMonochrome};  
                                      fill: ${display[_theme].text};
                                      text-anchor: middle;
                                      dominant-baseline: central;              
                                    }
                                                    
                ${_impl.self()} .border {
                      fill: none;
                      stroke: ${display[_theme].axis};
                      stroke-width: ${widths.axis};
                      stroke-linejoin: round;
                      stroke-linecap: round;
                      pointer-events: none;
                    }
                
                ${_impl.self()} .fill {
                      fill: #010539;
                    }

                ${_impl.self()} .graticule {
                      fill: none;
                      stroke: ${display[_theme].grid};
                      stroke-width: 0.5px;
                      pointer-events: none;
                    }

                  ${_impl.self()} .boundary {
                    fill: none;
                    stroke: #fff;
                    stroke-width: 0.5px;
                    pointer-events: none;
                  }
                `;
    
  _impl.classed = function(value) {
    return arguments.length ? (classed = value, _impl) : classed;
  };
    
  _impl.background = function(value) {
    return arguments.length ? (background = value, _impl) : background;
  };

  _impl.theme = function(value) {
    return arguments.length ? (theme = value, _impl) : theme;
  };  

  _impl.size = function(value) {
    return arguments.length ? (width = value, height = null, _impl) : width;
  };
    
  _impl.width = function(value) {
    return arguments.length ? (width = value, _impl) : width;
  };  

  _impl.height = function(value) {
    return arguments.length ? (height = value, _impl) : height;
  }; 

  _impl.scale = function(value) {
    return arguments.length ? (scale = value, _impl) : scale;
  }; 

  _impl.margin = function(value) {
    return arguments.length ? (margin = value, _impl) : margin;
  };   

  _impl.graticule = function(value) {
    return arguments.length ? (graticule = value, _impl) : graticule;
  };      

  _impl.projection = function(value) {
    return arguments.length ? (projection = value, _impl) : projection;
  };     

  _impl.projectionScale = function(value) {
    return arguments.length ? (projectionScale = value, _impl) : projectionScale;
  }; 

  _impl.interrupted = function(value) {
    return arguments.length ? (interrupted = value, _impl) : interrupted;
  };    
  
  _impl.country = function(value) {
    return arguments.length ? (country = value, _impl) : country;
  };   

  _impl.fill = function(value) {
    return arguments.length ? (fill = value, _impl) : fill;
  };   

  _impl.pointsDisplay = function(value) {
    return arguments.length ? (pointsDisplay = value, _impl) : pointsDisplay;
  };  

  _impl.zoom = function(value) {
    return arguments.length ? (zoom = value, _impl) : zoom;
  }; 
  
  _impl.zoomX = function(value) {
    return arguments.length ? (zoomX = value, _impl) : zoomX;
  }; 
  
  _impl.zoomY = function(value) {
    return arguments.length ? (zoomY = value, _impl) : zoomY;
  }; 

  _impl.points = function(value) {
    return arguments.length ? (points = coerceArray(value), _impl) : points;
  };  

  _impl.links = function(value) {
    return arguments.length ? (links = coerceArray(value), _impl) : links;
  };  
  
  _impl.linksDisplay = function(value) {
    return arguments.length ? (linksDisplay = value, _impl) : linksDisplay;
  }; 

  _impl.onClick = function(value) {
    return arguments.length ? (onClick = value, _impl) : onClick;
  }; 


  return _impl;
}