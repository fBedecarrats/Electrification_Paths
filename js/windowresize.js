d3.select(window).on('resize', resized);

function resized() {

  var w = d3.select('.bar-chart-area').node().clientWidth - 5;

  d3.selectAll('.bar-chart-svg')
    .attr('width', w);

  xScale
    .range([0, w]);

  d3.selectAll('.bar-group')
    .attr('transform', function(d) {
      return 'translate(' + xScale(d.y0) + ',0)'
    });

  d3.selectAll('.bar')
    .attr('width', function(d) {
      return xScale(d.y1 - d.y0);
    });

}
