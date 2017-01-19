var Chart = {
  dimensions: function(w, h, data, bounds) {
    this.w = w;
    this.h = h;
    this.data = data;
    this.bounds = bounds;
  },
  createLine: function(x1, y1, x2, y2, color, w) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    //scale line
    x1 = x1*10;
    x2 = x2*10;
    y1 = y1*10;
    y2 = y2*10;
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
    var canvasOuter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var canvasInner = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvasOuter.setAttribute('width', w);
    canvasOuter.setAttribute('height', h);
    canvasOuter.setAttribute('viewbox', '0 0 800 600')
    canvasOuter.setAttribute('class', 'outer')
    canvasInner.setAttribute('width', w);
    canvasInner.setAttribute('height', h);
    canvasInner.setAttribute('viewbox', '0 0 800 600')
    canvasInner.setAttribute('class', 'inner')
    canvasOuter.append(canvasInner)
    container.appendChild( canvasOuter );
    return canvasOuter;
  }
}

module.exports = {
  Chart
}

