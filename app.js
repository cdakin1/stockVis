const bboList = stock.bboList;
const tradeList = stock.tradeList;
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    k = height / width
// // parse the date / time
var parseTime = d3.timeParse("%H:%M:%S.%L");

//parse nanoseconds for tradeList object
var parseNano = function(nano) {
  let hour = Math.floor(nano / 3600000000000);
  let temp = nano % 3600000000000;
  let minute = Math.floor(temp / 60000000000);
  let temp2 = temp % 60000000000;
  let second = Math.floor(temp2 / 1000000000);
  let mil = temp2 % 1000000000;
  hour = hour.toString()
  minute = minute.toString()
  second = second.toString();
  mil = mil.toString().slice(0, 3)
  return parseTime(`${hour}:${minute}:${second}.${mil}`)
}


//
// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var x0 = d3.scaleTime().range([0, width]);;
var y0 = d3.scaleLinear().range([height, 0]);;

//define axes
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

// define the areas
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

// define the lines for bid/ask
var valueline = d3.line()
    .x(function(d) { return x(d.timeStr); })
    .y(function(d) { return y(d.ask); })
    .curve(d3.curveStepAfter);

var valueline2 = d3.line()
    .x(function(d) { return x(d.timeStr); })
    .y(function(d) { return y(d.bid); })
    .curve(d3.curveStepAfter);

// define div for tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var tradeCircle = document.getElementsByClassName('tradeCircle');

//zoom stuff
var brush = d3.brush().on("end", brushended),
    idleTimeout,
    idleDelay = 350;

function brushended() {
  var s = d3.event.selection;
  //if no selection, reset zoom (double click)
  if (!s) {
    if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
    x.domain(d3.extent(bboList, function(d) { return d.timeStr; }));
    y.domain([d3.min(bboList, function(d) { return d.bid * 0.995 }), d3.max(bboList, function(d) { return d.ask * 1.005 ; })]);
  } else {
  //set zoom to selection
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
  svg.selectAll(".tradeCircle").transition(t)
     .attr("cx", function(d) { return x(d.time); })
     .attr("cy", function(d) { return y(d.price); });

}


// format the data
bboList.forEach(function(d) {
    d.timeStr = parseTime(d.timeStr);
    // d.ask = d.ask / 10000;
    // d.bid = d.bid / 10000;
});

tradeList.forEach(function(d) {
  d.time = parseNano(d.time);
})


// scale the range of the data
x.domain(d3.extent(bboList, function(d) { return d.timeStr; }));
y.domain([d3.min(bboList, function(d) { return d.bid * 0.995 }), d3.max(bboList, function(d) { return d.ask * 1.005 ; })]);

// add the areas
  svg.append("path")
     .data([bboList])
     .attr("class", "area")
     .attr("d", area);

  svg.append("path")
     .data([bboList])
     .attr("class", "area2")
     .attr("d", area2);

// add the valueline path
svg.append("path")
    .data([bboList])
    .attr("class", "line")
    .attr("d", valueline)
    .append("svg:title")

svg.append("path")
    .data([bboList])
    .attr("class", "line2")
    .attr("d", valueline2)

// add tradePrice circles
var circles = svg.selectAll("dot")
        .data(tradeList)
        .enter()
        .append("circle")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d.time); })
        .attr("cy", function(d) { return y(d.price); })
        .attr("class", "tradeCircle")
        .attr("d", tradeCircle)
        .each(function(d) {
          var trade = d3.select(this);
          d.tradeType === 'E' ? trade.style('fill', 'blue') : trade.style('fill', 'pink')
        })
        .on("mouseover", function(d) {
            div.transition()
               .duration(200)
               .style("opacity", .9);
            div.html("Price: " + d.price + "<br/>" + "#Shares: " + d.shares + "<br/>" + "Type: " + d.tradeType)
               .style("left", (d3.event.pageX) + "px")
               .style("top", (d3.event.pageY - 100) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
               .duration(500)
               .style("opacity", 0);
        });



// add the X Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "xAxis")
    .call(xAxis);

// add the Y Axis
svg.append("g")
    .attr("class", "yAxis")
    .call(yAxis.tickFormat(d3.format(".0f")));


// code for getting data on mouseover
var focus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

//price circle on graph
focus.append("circle")
    .attr("r", 4.5);

//price text on graph
focus.append("text")
    .attr("class", "floatingText")
    .attr("x", 9)
    .attr("dy", ".35em");

// trade information tracking
function toggleMouseover() {
  var tm = document.getElementById("toggleMousover");
  var mouseoverType = tm.options[tm.selectedIndex].value;

  mouseoverType === "trend" ?
    svg.append("rect")
       .attr("class", "overlay")
       .attr("width", width)
       .attr("height", height)
       .on("mouseover", function() { focus.style("display", null); })
       .on("mouseout", function() { focus.style("display", "none"); })
       .on("mousemove", mousemove)
    : d3.select(".overlay").remove();
}

// stock trend tracking
function mousemove() {
  var spt = document.getElementById("stockPriceType");
  var priceType = spt.options[spt.selectedIndex].value;
  var data = bboList;
  var bisectDate = d3.bisector(function(d) { return d.timeStr; }).left;
  var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = x0 - d0.timeStr > d1.timeStr - x0 ? d1 : d0,
      activeD;
  priceType === 'bid' ? activeD = d.bid : activeD = d.ask;

  focus.attr("transform", "translate(" + x(d.timeStr) + "," + y(activeD) + ")");
  focus.select("text").text(activeD);
}

var displayTradeSize = false;
function toggleTradeSize() {
    if(!displayTradeSize) {
      displayTradeSize = true;
      circles.each(function(d) {
        var trade = d3.select(this);
        d.shares < 50 ? trade.attr("r", 2) : trade.attr("r", d.shares / 25)
      })
    } else {
      displayTradeSize = false;
      circles.attr("r", 3.5)
    }
}

var enableZoom = true;
function toggleZoom() {
  var button = document.getElementById("toggleZoom");
  if(enableZoom) {
    enableZoom = false;
    button.textContent = "Disable Zoom";
    svg.append("g")
        .attr("class", "brush")
        .call(brush);
  } else {
    enableZoom = true;
    button.textContent = "Enable Zoom";
    d3.select(".brush").remove();
  }
}

function resetZoom() {
  x.domain(d3.extent(bboList, function(d) { return d.timeStr; }));
  y.domain([d3.min(bboList, function(d) { return d.bid * 0.995 }), d3.max(bboList, function(d) { return d.ask * 1.005 ; })]);
  zoom();
}

function toggleVisibility() {
  var ttv = document.getElementById("toggleTradeVisibility");
  var vis = ttv.options[ttv.selectedIndex].value;
  switch(vis) {
    case 'all':
        circles.style("visibility", "visible");
        break;
    case 'p':
        circles.each(function(d) {
          d.tradeType === 'E' ?
            d3.select(this).style("visibility", "hidden")
          : d3.select(this).style("visibility", "visible")
        })
        break;
    case 'e':
        circles.each(function(d) {
          d.tradeType === 'P' ?
            d3.select(this).style("visibility", "hidden")
          : d3.select(this).style("visibility", "visible")
        })
        break;
    case 'none':
        circles.style("visibility", "hidden");
  }
}
