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
 createLine: function(x1, y1, x2, y2, color, w, bufferX, bufferY, scale) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    //scale line
    x1 = ((x1 + bufferX) * scale).toFixed(2);
    x2 = ((x2+bufferX) * scale).toFixed(2);
    y1 = ((y1+bufferY) * scale).toFixed(2);
    y2 = ((y2+bufferY) * scale).toFixed(2);
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', w);
    return line;
  },
  translate: function() {
    //translate lines//
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
      var line = this.createLine(val1[0], val1[1], val2[0], val2[1], 'red', 1, bufferX, bufferY, 10);
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

