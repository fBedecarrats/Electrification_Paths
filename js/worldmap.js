//// D3 VERSION

var widthMap = d3.select('#map-area').node().clientWidth,
  heightMap = window.screen.availHeight * 0.5,
  centered;

d3.select('.cover')
  .style("width", widthMap + "px")
  .style("height", heightMap + "px");

var projection = d3.geo.equirectangular()
  .center([18, 0])
  .scale(350)
  .translate([widthMap / 2, heightMap / 2]);

var path = d3.geo.path()
  .projection(projection);

var pointColors = d3.scale.ordinal()
  .range(['#73B2FF', '#AAFF00', '#FBB117']) //
  .domain(['National Grid', 'Mini Grid', 'Stand Alone']);

var linesColors = d3.scale.ordinal()
  .range(['#4d4d4d', '#4d4d4d']) //
  .domain(['Existing Trans. Line', 'Planned Trans. Line']);

var svgMap = d3.select('#map-area').append('svg')
  .attr({
    id: 'map',
    width: widthMap,
    height: heightMap
  });

var countries = svgMap.append("g")
  .attr("class", "countries");

var zoom = d3.behavior.zoom()
  .scaleExtent([0.5, 200])
  .on("zoom", zoomed);

Pace.on("done", function() {
  $(".cover").fadeOut(500);
});

Pace.on("start", function() {
  $(".cover").fadeIn(1);
})

function zoomed() {
  countries.attr({
    transform: "translate(" + zoom.translate() + ")" + "scale(" + zoom.scale() + ")"
  });

  d3.selectAll('.country-label').style('font-size', 0.8 / zoom.scale() + 'em');
}

function interpolateZoom(translate, scale) {
  return d3.transition().duration(750).tween("zoom", function() {
    var t = d3.interpolate(zoom.translate(), translate),
      s = d3.interpolate(zoom.scale(), scale);

    return function(d) {
      zoom.translate(t(d));
      zoom.scale(s(d));

      zoomed();
    };
  });
}

svgMap.call(zoom)

function update_map(country) {
  Pace.restart();

  var split = _g.current_diesel + _g.current_tier.toString();

  queue()
    .defer(d3.json, './data/grids/' + country['iso3'] + '_grids.json')
    .await(function(err, country) {
      loadCountryGrids(err, country, split)
    });
}

function loadWorld(worldTopo, countriesList) {
  var countryBoundaries = topojson.feature(worldTopo, worldTopo.objects.countries).features;

  var landBoundaries = topojson.feature(worldTopo, worldTopo.objects.land);

  var state = countryBoundaries.filter(function(d) {
    return d.id === countryByISO3(getQueryParam('iso3')).code;
  })[0];

  countries.insert("path")
    .datum(landBoundaries)
    .attr("class", "land")
    .attr("d", path)
    .classed("outline", true)
    .style("fill", "none");

  countries.selectAll(".country")
    .data(countryBoundaries)
    .enter().append("path")
    .attr({
      class: function(d) {
        return "country country" + d.id;
      },
      d: path
    })
    .style({
      fill: function(d) {
        if (d.id == countryByISO3(getQueryParam('iso3')).code) {
          return "#ffffff";
        } else {
          if (d.id == 24) {
            return "red";
          } else {
            return "#eeeeee";
          }

        }
      }
    })

  countryLabels = countries.selectAll("text")
    .data(countryBoundaries)
    .enter().append("text")
    .attr({
      class: 'country-label',
      transform: function(d) {
        return "translate(" + path.centroid(d) + ")";
      },
    })
    .append('tspan')
    .text(function(d) {
      return findCountryName(d);
    })
    .on({
      mouseover: function(d) {
        d3.select(this).style({
          "fill": "#00adef",
          "cursor": "pointer"
        })
      },
      mouseout: function(d) {
        d3.select(this).style("fill", "#4d4d4d")
      },
      dblclick: function(d) {
        var ccode = findCountryISO(d);
        var country = countryByISO3(ccode)
        if ((country.region == _g.region) && ($.inArray(country.subregion, _g.ignored_subregions))) {
          window.location = "./playground.html?iso3=" + findCountryISO(d) + "&tier=3&diesel_price=nps";
        } else {
          alert("Electrification model not available. Choose another country.")
        }
      }
    })


  countries.append("path")
    .datum(state)
    .attr("class", "outline")
    .attr("d", path);

  //legend for grid
  var width_legend = d3.select('#map-legend').node().clientWidth;
  var height_legend = 80;
  var padding_legend = 35;

  var legend_svg = d3.select("#map-legend")
    .append("svg")
    .attr({
      "width": width_legend,
      "height": height_legend
    });

  var legend_grad = legend_svg.selectAll('.legend-group')
    .data(['National Grid', 'Mini Grid', 'Stand Alone'])
    .enter().append('defs')
    .append("svg:linearGradient")
    .attr({
      "id": function(d, i) {
        return 'gradient' + i;
      },
      "x1": "100%",
      "y1": "100%",
      "x2": "0%",
      "y2": "100%",
      "spreadMethod": "pad",
      "y": function(d, i) {
        return i * 15;
      }
    });

  legend_grad.append("stop")
    .attr({
      "offset": "0%",
      "stop-color": function(d, i) {
        return pointColors.range()[i];
      },
      "stop-opacity": 1
    });

  legend_grad.append("stop")
    .attr({
      "offset": "100%",
      "stop-color": function(d, i) {
        return pointColors.range()[i];
      },
      "stop-opacity": function(d) {
        if (d == 'Stand Alone') {
          return 0.2
        } else {
          return 0.3
        }
      }
    });

  var legend = legend_svg.selectAll('.legend-group')
    .data(['National Grid', 'Mini Grid', 'Stand Alone'])
    .enter().append('g')
    .attr({
      class: 'legend-group',
      transform: function(d, i) {
        return 'translate(0,' + ((20 * i) + 10) + ')'
      }
    });

  legend.append("rect")
    .attr({
      "width": 100,
      "height": 12,
      "x": 100,
      "y": 2
    })
    .style("fill", function(d, i) {
      return "url(#gradient" + i + ")";
    })

  legend.append('text')
    .attr({
      y: 12
    })
    .text(function(d) {
      return d;
    })
    .style('fill', '#4d4d4d');

  legend.append("text")
    .attr("x", 100 - 2)
    .attr("y", 12)
    .style({
      "text-anchor": "end",
      "fill": "#4d4d4d"
    })
    .text(0);

  legend.append("text")
    .attr("x", 100 + 102)
    .attr("y", 12)
    .style({
      "text-anchor": "start",
      "fill": "#4d4d4d"
    })
    .text("100,000+");

  //legend for lines

  var width_lines_legend = d3.select('#map-legend-lines').node().clientWidth;
  var height_lines_legend = 80;
  var padding_lines_legend = 35;

  var lineData = [{
    "x": 15,
    "y": 7
  }, {
    "x": 30,
    "y": 7
  }];

  var lineFunction = d3.svg.line()
    .x(function(d) {
      return d.x;
    })
    .y(function(d) {
      return d.y;
    })
    .interpolate("linear");

  var legend_lines_svg = d3.select("#map-legend-lines")
    .append("svg")
    .attr({
      "width": width_lines_legend,
      "height": height_lines_legend
    });

  var legend_lines = legend_lines_svg.selectAll('.legend-group')
    .data(['Existing Trans. Line', 'Planned Trans. Line'])
    .enter().append('g')
    .attr({
      class: 'legend-group',
      transform: function(d, i) {
        return 'translate(0,' + ((20 * i) + 10) + ')'
      }
    });

  legend_lines.append('path')
    .attr("d", lineFunction(lineData))
    .attr("stroke-width", 2)
    .style({
      'stroke': function(d, i) {
        return linesColors.range()[i];
      },
      'stroke-dasharray': function(d) {
        if (d == 'Planned Trans. Line') {
          return 0.4;
        }
      },
      'stroke-dashoffset': function(d) {
        if (d == 'Planned Trans. Line') {
          return 0.4;
        }
      },


    });

  legend_lines.append('text')
    .attr({
      x: 35,
      y: 12
    })
    .text(function(d) {
      return d;
    })
    .style('fill', '#4d4d4d');
}

function pickGridColor(grid, split) {
  var p = grid['population_2030'];

  var min, grid_op = 0;

  // the value at which we consider an area as "very dense"
  // and set the opacity to 1.
  //
  var h = 100000;

  // min opacity for "National Grid" and "Mini Grid":
  //
  var min_g_mg = 0.3;

  // min opacity for "Stand Alone":
  //
  var min_sa = 0.2;

  if (!p) return 0;

  if (grid[split] === "Stand Alone")
    min = min_sa;
  else
    min = min_g_mg;

  // scale linearly between (min..1)
  //
  if (p < h)
    grid_op = ((p / h) * (1 - min)) + min
  else
    grid_op = 1;

  return grid_op;
}

function loadCountryGrids(err, countryGrids, split) {
  if (err) console.warn('error', err);

  d3.selectAll('rect.point-group').remove()

  var points = countries.selectAll('.point-group')
    .data(countryGrids)
    .enter().append('rect')
    .attr({
      class: 'point-group',
      transform: function(d) {
        var p = projection([d.x, d.y]);
        return "translate(" + (p[0] - 0.2) + "," + (p[1] - 0.2) + ")"
      },
      fill: function(d) {
        return pointColors(d[split]);
      },
      width: 0.4,
      height: 0.4,
      opacity: function(d) {
        return pickGridColor(d, split);
      },
      xval: function(d) {
        return d.x;
      },
      yval: function(d) {
        return d.y;
      }
    })
    .on({
      mouseover: function(d) {
        d3.select('#grid-marker').attr({
          transform: function() {
            var p = projection([d.x, d.y]);
            return "translate(" + (p[0] - 0.2) + "," + (p[1] - 0.2) + ")"
          }
        })

        _g.current_grid['technology'] = d[_g.current_diesel + _g.current_tier];
        _g.current_grid['lcoe'] = d['lcoe_' + _g.current_diesel + _g.current_tier];
        _g.current_grid['population_2030'] = d['population_2030'];
      }
    });

  var countryCode = countryGrids[0].country_code,
    countryPath = d3.select('.country' + countryCode);

  var x, y, k;

  if (countryPath && centered !== countryPath) {
    var centroid = path.centroid(countryPath.datum());
    x = centroid[0];
    y = centroid[1];
    centered = countryPath;
  }

  countries.selectAll("path")
    .classed("active", centered && function(d) {
      return d === centered;
    });

  var center = [widthMap / 2, heightMap / 2];
  var k = country_bounds(countryPath.datum())['scale'];

  //outline for hovered grid
  countries.append("rect")
    .attr({
      id: 'grid-marker',
      width: 0.4,
      height: 0.4
    })

  .style({
    'fill': 'none',
    'stroke': '#00adef',
    'stroke-width': 0.1,
    'border-radius': 2,
    'z-index': 999999
  });

  interpolateZoom([center[0] - (centroid[0] * k), center[1] - (centroid[1] * k)], k);
}

function country_bounds(d) {
  var bounds = path.bounds(d),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2

  scale = .9 / Math.max(dx / widthMap, dy / heightMap),
    translate = [widthMap / 2 - scale * x, heightMap / 2 - scale * y];

  return {
    scale: scale,
    translate: translate
  };
}



function draw_transmission_lines(features, cls) {
  countries.selectAll(".transmission-line-" + cls)
    .data(features)
    .enter().append('path')

  .attr({
    class: "transmission-line-" + cls,
    d: d3.geo.path().projection(projection),
    'stroke-width': 0.2,
    fill: "none"
  });
}
