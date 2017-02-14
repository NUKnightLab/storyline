var moment = require('moment');

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
    var xAxis = this.domain("year", 10);
    var yAxis = this.range();
    this.setTranslation();
    this.createCanvas();
    this.drawLine(xAxis, yAxis);
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
  domain: function(timeDenominations, intervals) {
    var ticks,
        xAxisRange = this.bounds.maxX[timeDenominations]() - this.bounds.minX[timeDenominations]();
    if(intervals != undefined) {
      ticks = xAxisRange/intervals
    } else {
      ticks = xAxisRange
    }
    return ticks;
  },
  range: function(intervals) {
    var ticks;
    if(intervals != undefined) {
      ticks = this.rangeY/intervals
    } else {
      ticks = this.rangeY
    }
    return ticks;
  },
  addTicks: function(ticks, axis, timeDenomination, intervals) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
        labels=[];
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', '#000');
   
    //var xdistBetweenTicks = this.width/ticks

    g.setAttribute('fill', 'none')

    for(var i=0; i<=ticks; i++) {
      var tick = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          tickStroke = document.createElementNS('http://www.w3.org/2000/svg', 'line'),
          tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text'),
          min = `min${axis.toUpperCase()}`,
          max = `max${axis.toUpperCase()}`;

      if(axis === 'x') {
        var distBetweenTicks = this.width/ticks,
            TRANSLATE = this.height,
            start = this.bounds[min][timeDenomination](),
            end = this.bounds[max][timeDenomination]();
        tickStroke.setAttribute('x1', 16);
        tickStroke.setAttribute('x2', 16);
        tickStroke.setAttribute('y2', 6);
        tick.setAttribute("transform", `translate(${distBetweenTicks*i}, ${TRANSLATE})`);
        tickLabel.setAttribute('x', 0.5);
        tickLabel.setAttribute('y', 9);
        tickLabel.setAttribute('dy', '0.71em');
        tickLabel.innerHTML = (start + i*intervals);
        path.setAttribute('d', `M0,${TRANSLATE}h${this.width}`)
      } else {
        var distBetweenTicks = this.height/ticks,
            TRANSLATE = 0,
            start = this.bounds[min],
            end = this.bounds[max];
        tickStroke.setAttribute('y1', 0.5);
        tickStroke.setAttribute('y2', 0.5);
        tickStroke.setAttribute('x2', -6);
        tick.setAttribute("transform", `translate(${TRANSLATE}, ${distBetweenTicks*i})`);
        tickLabel.setAttribute('x', -10);
        tickLabel.setAttribute('y', 0.5);
        tickLabel.setAttribute('dy', '0.31em');
        tickLabel.setAttribute('text-anchor', 'end')
        tickLabel.innerHTML = (start + i*intervals);
        path.setAttribute('d', `M0,${TRANSLATE}v${this.height}`)
      }
      tickStroke.setAttribute('stroke', 'black');
      tickLabel.setAttribute("fill", "#000");
      tick.append(tickStroke);
      tick.append(tickLabel);
      g.append(tick);
    }

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
  drawLine: function(xAxis, yAxis) {
   var line = "M",
       marks = [],
       counter = 0;

   for(var i=0; i < this.data.length; i++) {
     var x = ((this.data[i][0].valueOf() * this.SCALEX) + this.translateX);
     var y = this.height - (((this.data[i][1] * this.SCALEY)) + this.translateY);

     line += x + "," + y;
     if(i < this.data.length-1) {
       if(i === this.data.length-1) {
         debugger;
       }
       line += "L";
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
   var lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');

   debugger;
   lineEl.setAttribute('d', line);
   lineEl.setAttribute('stroke', 'grey');
   lineEl.setAttribute('fill', 'none');
   this.elem.appendChild(lineEl);

   var tick = this.addTicks(xAxis, 'x', "year", 10);
   debugger;
   var tick2 = this.addTicks(yAxis, 'y', 10);
   this.elem.appendChild(tick);
   this.elem.appendChild(tick2);
  },
  /**
   * create an empty svg object "canvas" where line graph will be drawn
   *
   * @returns {undefined}
   */
  createCanvas : function(){
    var canvasOuter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var canvasInner = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    canvasOuter.setAttribute('width', this.width);
    canvasOuter.setAttribute('height', this.height);
    canvasOuter.setAttribute('class', 'canvas');
    debugger;
    canvasOuter.append(canvasInner);
    this.canvas = canvasOuter;
    this.elem = canvasInner;
  },
}

module.exports = {
  Chart
}

