var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// // parse the date / time
var parseTime = d3.timeParse("%H:%M:%S.%L");
//
// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var y2 = d3.scaleLinear().range([height, 0]);

// define the area
var area = d3.area()
    .x(function(d) { return x(d.timeStr); })
    .y0(height)
    .y1(function(d) { return y(d.bid); })
    .curve(d3.curveStepAfter);

var area2 =d3.area()
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
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

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
      .call(d3.axisBottom(x));
  //
  // add the Y Axis
  svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".0f")));
