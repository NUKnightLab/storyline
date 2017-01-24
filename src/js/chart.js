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
  createLine: function(count, firstCoord, secondCoord, color, w, bufferX, bufferY, scale) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    //scale line using translate function//
    var firstNode = this.translateLine(count, firstCoord, bufferX, bufferY, scale);
	var secondNode = this.translateLine(count+1, secondCoord, bufferX, bufferY, scale);
    line.setAttribute('x1', firstNode.x);
    line.setAttribute('y1', firstNode.y);
    line.setAttribute('x2', secondNode.x);
    line.setAttribute('y2', secondNode.y);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', w);
    return line;
  },
  translateLine: function(count, coord, bufferX, bufferY, scale) {
    var xLine = ((count + bufferX) * scale);
    var yLine = ((coord[1] + bufferY) * scale).toFixed(2);
    return {
      "x": xLine,
      "y": yLine
    }
  },
  createTicks: function(data, intervals, endBound) {
    var totalTick = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        numTicks = Math.round(endBound/intervals.xTick),
        g = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
        SCALE=10,
        TRANSLATEY=300,
        maxRange,
        xLabels=[0];
   
    maxRange = numTicks*intervals.xTick * SCALE;
    for(var j=0;j<numTicks;j++) {
      var interval = j*intervals.xTick
      xLabels.push(data[interval][0])
    }

    g.setAttribute('fill', 'none')

    for(var i=0; i<= numTicks; i++) {
      var tick = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          tickStroke = document.createElementNS('http://www.w3.org/2000/svg', 'line'),
          tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text'),
          mark = i*intervals.xTick;

      tickStroke.setAttribute('x2', 0);
      tickStroke.setAttribute('y2', 6);
      tickStroke.setAttribute('stroke', 'black');
      tick.setAttribute("transform", `translate(${mark*SCALE}, ${TRANSLATEY})`);
      tickLabel.setAttribute("fill", "#000");
      tickLabel.setAttribute('x', 0.5);
      tickLabel.setAttribute('y', 9);
      tickLabel.setAttribute('dy', '0.71em');

      tickLabel.innerHTML = (xLabels[i]);
      tick.append(tickStroke);
      tick.append(tickLabel);
      g.append(tick);
    }

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', '#000');
    path.setAttribute('d', `M0,${TRANSLATEY}V${TRANSLATEY}H${maxRange}V${TRANSLATEY}`)
    g.append(path)
    totalTick.append(g);
    return totalTick;
  },
  createMarkers: function(rows) {
  },
  drawLine: function() {
    var bufferX = 0, bufferY = 0;

    //account for negatives by shifting axes over in the positive direction//
    bufferX = this.bounds.minX < 0 ? -this.bounds.minX : 0;
    bufferY = this.bounds.minY < 0 ? -this.bounds.minY : 0;
    for(var i=1; i < this.data.length; i++) {
      var val2 = this.data[i];
      var val1 = this.data[i-1];
      var line = this.createLine(i, val1, val2, 'red', 1, bufferX, bufferY, 10);
      this.elem.appendChild(line);
    }
    var tick = this.createTicks(this.data, this.intervals, this.bounds.maxX, 10);
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

