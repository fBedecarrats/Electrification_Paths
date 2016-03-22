function draw_doughnut_icon(container, tier) {
  var icon_file = "img/" + _g.tier_icons[tier] + "-icon.svg";

  d3.xml(icon_file, function(error, documentFragment) {
    if (error) {
      console.log(error);
      return;
    }

    var svgNode = documentFragment
        .getElementsByTagName("svg")[0];

    var containerIcon = container.append('g')
        .attr({
          class: 'doughnut-text'
        })

    containerIcon.node().appendChild(svgNode);

    var innerSVG = containerIcon.select("svg");

    innerSVG.attr({
      class: 'doughnut-icon',
      x: "-1em",
      y: "-1.5em",
      width: 25,
      height: 25
    });

  });
}

function draw_costs_graphs(opts, country, diesel_price) {
  _g.country = country;

  var position = opts.position;
  var width = opts.size.width;
  var height = opts.size.height;

  d3.selectAll("#costs-graph").remove()

  // bars

  var graph = opts.svg.append('g')
      .attr({
        id: 'costs-graph',
        transform: "translate(" + position.x + "," + position.y + ")"
      });

  var subgraph_size = {
    width: (width / 5) - _g.bar_graph_padding,
    height: height
  };

  var i = 1;

  while (i <= 5) {
    var summary = country["summary_" + diesel_price + i];

    var g = summary['cost_grid'];
    var mg = summary['cost_mg'];
    var sa = summary['cost_sa'];

    var total_cost = g + mg + sa;

    var sources = [{
      param: 'grid',
      value: g / total_cost,
      o_value: g
    }, {
      param: 'micro_grid',
      value: mg / total_cost,
      o_value: mg
    }, {
      param: 'stand_alone',
      value: sa / total_cost,
      o_value: sa
    }]

    var pp = pentagon_position(i, width / 4);

    doughnut_draw({
      id: "costs-graph" + i,
      svg: graph,
      position: {
        x: pp['x'],
        y: pp['y'],
      },

      radius: Math.min(width, height) / 6

    }, sources, i)

    i += 1;
  }
}

function doughnut_draw(opts, data, tier) {
  var radius = opts.radius;
  var position = opts.position;
  var x_vars = opts.x_vars;
  var param = opts.param;
  var svg = opts.svg;
  var id = opts.id

  var color = d3.scale.ordinal()
      .range(['#73B2FF', '#AAFF00', '#FBB117']);

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 20);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d.o_value;
      });

  var graph = opts.svg.append('g')
      .attr({
        id: id,
        class: 'doughnut-group',
        transform: "translate(" + opts.position.x + "," + opts.position.y + ")"
      });

  var g = graph.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")

  g.append("path")
    .attr({
      d: arc,
      class: "arc " + "arc" + tier,
    })

    .style({
      fill: function(d) {
        return color(d.data.param);
      },
      'fill-opacity': function(d) {
        if (tier === _g.current_tier)
          return 1;
        else
          return 0.2;
      },
    });

  graph.on({
    click: function(d) {
      return change_tier(tier);
    }
  });

  var cost = data
      .map(function(e) {
        return e['o_value']
      })
      .reduce(function(a, b) {
        return a + b;
      });

  graph.append("text")
    .attr({
      class: 'doughnut-text',
      dx: "-2.5em",
      dy: "1.5em"
    })
    .text(function(d) {
      return rivets.formatters.in_b(cost) + " US$";
    });

  draw_doughnut_icon(graph, tier)
}
