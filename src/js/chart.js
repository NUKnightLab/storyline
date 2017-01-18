var Chart = {
  dimensions: function(w, h, data, bounds) {
    this.w = w;
    this.h = h;
    this.data = data;
    this.bounds = bounds;
  },
  createLine: function(x1, y1, x2, y2, color, w) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', w);
    return line;
  },
  createCanvas : function(w, h, containerId){
    var container = document.getElementById(containerId);
    var canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    container.appendChild( canvas );
    return canvas;
  }
}

module.exports = {
  Chart
}

