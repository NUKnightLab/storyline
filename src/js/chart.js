var Chart = function(data, bounds, intervals, highlightRows) {
    this.data = data;
    this.bounds = bounds;
    this.intervals = intervals
    this.elem = this.createCanvas(bounds);
    this.createMarkers(highlightRows);
    this.drawLine();
};

Chart.prototype = {
  //create a single line
  createLine: function(firstCoord, secondCoord, color, w, bufferX, bufferY, scale) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    //scale line using translate function//
    var firstNode = this.translateLine(firstCoord, bufferX, bufferY, scale);
	var secondNode = this.translateLine(secondCoord, bufferX, bufferY, scale);
    line.setAttribute('x1', firstNode.x);
    line.setAttribute('y1', firstNode.y);
    line.setAttribute('x2', secondNode.x);
    line.setAttribute('y2', secondNode.y);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', w);
    return line;
  },
  translateLine: function(coord, bufferX, bufferY, scale) {
    var xLine = ((coord[0] + bufferX) * scale).toFixed(2);
    var yLine = ((coord[1] + bufferY) * scale).toFixed(2);
    return {
      "x": xLine,
      "y": yLine
    }
  },
  createTicks: function(intervals, endBound) {
    var totalTick = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for(var i=0; i<= endBound; i++) {
      var tick = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      var tickStroke = document.createElementNS('http://www.w3.org/2000/svg', 'line');

      tickStroke.setAttribute('x2', 0);
      tickStroke.setAttribute('y2', 6);
      tickStroke.setAttribute('stroke', 'black');

      tick.setAttribute("transform", `translate(${i*10}, 300)`);
      tick.append(tickStroke);
      totalTick.append(tick);
    }
    return totalTick;
  },
  createMarkers: function(rows) {
    console.log(rows)
  },
  drawLine: function() {
    var bufferX = 0, bufferY = 0;

    //account for negatives by shifting axes over in the positive direction//
    if(this.bounds.minX < 0) {
      bufferX = - this.bounds.minX;
    } else if(this.bounds.minY < 0) {
      bufferY = - this.bounds.minY;
    }
    for(var i=1; i < this.data.length; i++) {
      var val2 = this.data[i];
      var val1 = this.data[i-1];
      var line = this.createLine(val1, val2, 'red', 1, bufferX, bufferY, 10);
      this.elem.appendChild(line);
    }
    var tick = this.createTicks(this.intervals, this.bounds.maxX, 10);
    this.elem.appendChild(tick);
  },
  createCanvas : function(bounds){
    //find range//
    var minX;
    var maxX;
    var minY;
    var maxY;

    bounds.minX < 0 ? (minX = -bounds.minX) : (minX = bounds.minX)
    bounds.maxX < 0 ? (maxX = -bounds.maxX) : (maxX = bounds.maxX)
    bounds.minY < 0 ? (minY = -bounds.minY) : (minY = bounds.minY)
    bounds.maxY < 0 ? (maxY = -bounds.maxY) : (maxY = bounds.maxY)
    var rangeX = maxX + minX;
	var rangeY = maxY + minY;
    var canvasOuter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvasOuter.setAttribute('width', (rangeX*10));
    canvasOuter.setAttribute('height', (rangeY*10));
    canvasOuter.setAttribute('class', 'outer')
    return canvasOuter;
  },
}

module.exports = {
  Chart
}

