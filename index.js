var displayTradeSize = false,
    enableZoom = true;

// trade information tracking
function toggleMouseover() {
  var tm = document.getElementById("toggleMousover");
  var mouseoverType = tm.options[tm.selectedIndex].value;

  if(mouseoverType === "trend") {
    document.getElementById("stockPriceType").style.visibility = "visible";
    svg.append("rect")
       .attr("class", "overlay")
       .attr("width", width)
       .attr("height", height)
       .on("mouseover", function() { focus.style("display", null); })
       .on("mouseout", function() { focus.style("display", "none"); })
       .on("mousemove", mousemove);
    } else {
      document.getElementById("stockPriceType").style.visibility = "hidden";
      d3.select(".overlay").remove();
    }
}

// changes trades' displayed node size
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

// toggles zoom on/off
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

// reset zoom to original view
function resetZoom() {
  x.domain(d3.extent(bboList, function(d) { return d.timeStr; }));
  y.domain([d3.min(bboList, function(d) { return d.bid * 0.995 }), d3.max(bboList, function(d) { return d.ask * 1.005 ; })]);
  zoom();
}

// show/hide selected trade nodes
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
