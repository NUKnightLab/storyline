var Chart = function(dataObj, width, height) {
    this.data = dataObj.data;
    this.bounds = dataObj.bounds;
    this.intervals = dataObj.intervals;
    this.markers = dataObj.markers;
    this.width = width;
    this.height = height || (2/3) * width;
    this.init();
};

Chart.prototype = {
  init: function() {
    this.setRange();
    this.setScale();
    this.setTranslation();
    this.createCanvas();
    this.drawLine();
  },
  setRange: function() {
    this.rangeX = Math.abs(this.bounds.maxX.valueOf() - this.bounds.minX.valueOf());
    this.rangeY = Math.abs(this.bounds.maxY - this.bounds.minY);
  },
  setScale: function() {
    var AXIS_HEIGHT = 25;

    this.SCALEX = (this.width/this.rangeX);
    this.SCALEY = (this.height-AXIS_HEIGHT)/(this.rangeY);
  },
  setTranslation: function() {
    this.translateX = -1 * this.bounds.minX.valueOf() * this.SCALEX
    this.translateY = -1 * (this.bounds.minY * this.SCALEY)
  },
  addTicks: function(axis, intervals) {
    var range = `range${axis.toUpperCase()}`
    return this[range]/intervals
  },
  createTicks: function() {
    var d3Format = require('d3-format');
    var timeinUnix = {
          "seconds": 1000,
          "minutes": 6000,
          "hours": 36000000,
          "days": 86400000,
          "months": 2592000000,
          "years": 31622400000
        }
    var min = {};
    for (var property in timeinUnix) {
      var time = this.rangeX/timeinUnix[property]
	    //set min to first property//
      Object.keys(min).length === 0 ? min[property] = time : min

      if(time < min[Object.keys(min)]) {
	    min = {};
        min[property] = time;
      }
    }

    var timeTicks = Object.keys(min)[0]
    var totalTick = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        g = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
        data = this.data,
        intervals = Object.values(min)[0],
        endBound = this.bounds.maxX.valueOf(),
        numTicks = Math.round(endBound/intervals),
        TRANSLATEY = 360 - 25,
        maxRange,
        xLabels=[],
        year = this.bounds.minX.year();
   
    var spanOfData = (Math.round(min[timeTicks]) * this.SCALEX) + this.translateX;
    var distBetweenTicks = Math.abs(this.width/spanOfData);
    distBetweenTicks = this.width/min[timeTicks]

    g.setAttribute('fill', 'none')

    for(var i=0; i<=min[timeTicks]; i++) {
      var tick = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          tickStroke = document.createElementNS('http://www.w3.org/2000/svg', 'line'),
          tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text'),
          mark = i*intervals.xTick;

      tickStroke.setAttribute('x1', 16);
      tickStroke.setAttribute('x2', 16);
      tickStroke.setAttribute('y2', 6);
      tickStroke.setAttribute('stroke', 'black');
      tick.setAttribute("transform", `translate(${distBetweenTicks*i}, ${TRANSLATEY})`);
      tickLabel.setAttribute("fill", "#000");
      tickLabel.setAttribute('x', 0.5);
      tickLabel.setAttribute('y', 9);
      tickLabel.setAttribute('dy', '0.71em');
      tickLabel.innerHTML = (year + i);
      tick.append(tickStroke);
      tick.append(tickLabel);
      g.append(tick);
    }

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', '#000');
    path.setAttribute('d', `M0,${TRANSLATEY}h${this.width}`)
    g.append(path)
    
    return g;
  },
  createMarkers: function(x, y, counter) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 5);
    circle.setAttribute('fill', 'grey');
    circle.setAttribute('class', 'marker-' + counter);
    return circle
  },
  /**
   * Draws the line graph and moves it based on the range so that the graph is within view
   *
   * @returns {undefined}
   */
  drawLine: function() {
   var line = "",
       marks = [],
       counter = 0;

   for(var i=0; i < this.data.length; i++) {
     var x = ((this.data[i][0].valueOf() * this.SCALEX) + this.translateX);
     var y = this.height - (((this.data[i][1] * this.SCALEY)) + this.translateY);

     line += x + " " + y;

     if(i!=this.data.length-1) {
       line += ", ";
     }

     if(this.markers.indexOf(i) >=0) {
       var mark = this.createMarkers(x, y, counter);
       counter++;
       marks.push(mark);
       this.elem.appendChild(mark);
     }
   }

   //reassign markers to dom nodes//
   this.markers = marks;
   var lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');

   lineEl.setAttribute('points', line);
   lineEl.setAttribute('stroke', 'grey');
   lineEl.setAttribute('fill', 'none');
   this.elem.appendChild(lineEl);

   var tick = this.createTicks();
   this.elem.appendChild(tick);
  },
  /**
   * create an empty svg object "canvas" where line graph will be drawn
   *
   * @returns {undefined}
   */
  createCanvas : function(){
    var canvasOuter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvasOuter.setAttribute('width', this.width);
    canvasOuter.setAttribute('height', this.height);
    canvasOuter.setAttribute('class', 'canvas')
    this.elem = canvasOuter;
  },
}

module.exports = {
  Chart
}

