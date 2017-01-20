var Chart = function(w, h, data, bounds) {
    this.w = w;
    this.h = h;
    this.data = data;
    this.bounds = bounds;
    this.elem = this.createCanvas(w, h);
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
  },
  createCanvas : function(w, h){
    var canvasOuter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvasOuter.setAttribute('width', w);
    canvasOuter.setAttribute('height', h);
    canvasOuter.setAttribute('viewbox', '0 0 800 600')
    canvasOuter.setAttribute('class', 'outer')
    return canvasOuter;
  },
}

module.exports = {
  Chart
}

