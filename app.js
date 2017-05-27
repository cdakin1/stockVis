var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    k = height / width,
    x0 = [-4.5, 4.5],
    y0 = [-4.5 * k, 4.5 * k]
// // parse the date / time
var parseTime = d3.timeParse("%H:%M:%S.%L");
//
// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

//define axes
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

// define the area
var area = d3.area()
    .x(function(d) { return x(d.timeStr); })
    .y0(height)
    .y1(function(d) { return y(d.bid); })
    .curve(d3.curveStepAfter);

var area2 = d3.area()
  .x(function(d) { return x(d.timeStr) })
  .y0(0)
  .y1(function(d) { return y(d.ask); })
  .curve(d3.curveStepAfter);

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.timeStr); })
    .y(function(d) { return y(d.ask); })
    .curve(d3.curveStepAfter);

var valueline2 = d3.line()
    .x(function(d) { return x(d.timeStr); })
    .y(function(d) { return y(d.bid); })
    .curve(d3.curveStepAfter);


// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // .call(d3.zoom()
    //   .scaleExtent([1, 10])
    //   .on("zoom", function() {
    //     console.log("zooming")
    //     svg.attr("transform", d3.event.transform);
    //     svg.select("xAxis").call(xAxis);
    //     svg.select("yAxis").call(yAxis);
    //   }))
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
//zoom stuff

var brush = d3.brush().on("end", brushended),
    idleTimeout,
    idleDelay = 350;


function brushended() {
  var s = d3.event.selection;
  if (!s) {
    if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
    x.domain(x0);
    y.domain(y0);
  } else {
    x.domain([s[0][0], s[1][0]].map(x.invert, x));
    y.domain([s[1][1], s[0][1]].map(y.invert, y));
    svg.select(".brush").call(brush.move, null);
  }
  zoom();
}

function idled() {
  idleTimeout = null;
}

function zoom() {
  var t = svg.transition().duration(750);
  svg.select(".xAxis").transition(t).call(xAxis);
  svg.select(".yAxis").transition(t).call(yAxis);
  svg.select(".line").transition(t).attr("d", valueline);
  svg.select(".line2").transition(t).attr("d", valueline2);
  svg.select(".area").transition(t).attr("d", area);
  svg.select(".area2").transition(t).attr("d", area2);
}

//////////
  const bboList = stock.bboList
  // format the data
  console.log(stock)
  bboList.forEach(function(d) {
      d.timeStr = parseTime(d.timeStr);
      // d.ask = d.ask / 10000;
      // d.bid = d.bid / 10000;
  });

  // scale the range of the data
  x.domain(d3.extent(bboList, function(d) { return d.timeStr; }));
  y.domain([d3.min(bboList, function(d) { return d.bid * 0.995 }), d3.max(bboList, function(d) { return d.ask * 1.005 ; })]);
  // add the area
    svg.append("path")
       .data([bboList])
       .attr("class", "area")
       .attr("d", area);

    svg.append("path")
       .data([bboList])
       .attr("class", "area2")
       .attr("d", area2);

  // // add the valueline path.
  svg.append("path")
      .data([bboList])
      .attr("class", "line")
      .attr("d", valueline);

  svg.append("path")
    .data([bboList])
    .attr("class", "line2")
    .attr("d", valueline2)
  //
  // // add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "xAxis")
      .call(xAxis);
  //
  // add the Y Axis
  svg.append("g")
      .attr("class", "yAxis")
      .call(yAxis.tickFormat(d3.format(".0f")));

// add brush
svg.append("g")
    .attr("class", "brush")
    .call(brush);
