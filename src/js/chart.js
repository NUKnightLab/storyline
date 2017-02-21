var moment = require('moment');

var Chart = function(dataObj, width, height, margin) {
    this.data = dataObj.data;
    this.bounds = dataObj.bounds;
    this.axes = dataObj.axes;
    this.markers = dataObj.markers;
    this.margin = margin || { 'top': 30, 'right': 50, 'bottom': 30, 'left': 20 };
    this.width = width - this.margin.right - this.margin.left;
    this.height = height - this.margin.top - this.margin.bottom ;
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
  /**
   * sets the range of the chart
   *
   * @returns {undefined}
   */
  setRange: function() {
    this.rangeX = Math.abs(this.bounds.maxX.valueOf() - this.bounds.minX.valueOf());
    this.rangeY = Math.abs(this.bounds.maxY - this.bounds.minY);
  },
  /**
   * sets the scale to enlarge the data points by
   *
   * @returns {undefined}
   */
  setScale: function() {
    var AXIS_HEIGHT = 25;

    this.SCALEX = (this.width/this.rangeX);
    this.SCALEY = (this.height-AXIS_HEIGHT)/(this.rangeY);
  },
  /**
   * sets the degree of translation so the datapoints are made positive and within the view
   *
   * @returns {undefined}
   */
  setTranslation: function() {
    this.translateX = -1 * this.bounds.minX.valueOf() * this.SCALEX
    this.translateY = -1 * (this.bounds.minY * this.SCALEY)
  },
  createTicks: function(start, end, intervals) {
    var ticks = [];
    if(intervals != undefined) {
      for(var i=start;i<=end;i+=intervals){
        ticks.push(i)
      }
    } else {
      for(var i=start;i<=end;i+=1){
        ticks.push(i)
      }
    }
    return ticks;
  },
  /**
   * Creates an object of the range including ticks, distance between ticks and x axis label
   *
   * @returns {object}
   */
  makeDomain: function() {
    var xLabel = this.axes.xLabel,
        intervals = this.axes.xTick,
        start = this.bounds.minX[xLabel.toLowerCase()](),
        end = this.bounds.maxX[xLabel.toLowerCase()](),
        tickDist = (end - start)/intervals,
        ticks = this.createTicks(start, end, intervals);

    return { "ticks": ticks,
             "distance": tickDist,
             "label": xLabel
           };
  },
  /**
   * Creates an object of the range, including array of ticks, and y axis label
   *
   * @returns {object}
   */
  makeRange: function() {
    var yLabel = this.axes.yLabel,
        intervals = this.axes.yTick,
        start = this.bounds.minY,
        end = this.bounds.maxY,
        ticks = this.createTicks(start, end, intervals);

    return {
      "ticks": ticks,
      "label": yLabel
    }
  },
  addTicks: function(ticks, axis) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', '#000');
    g.setAttribute('fill', 'none')

    for(var i=0; i<ticks.ticks.length; i++) {
      var tick = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          tickStroke = document.createElementNS('http://www.w3.org/2000/svg', 'line'),
          tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text'),
          min = `min${axis.toUpperCase()}`,
          max = `max${axis.toUpperCase()}`;

      if(axis === 'x') {
        var distBetweenTicks = this.width/ticks.distance,
            TRANSLATE = this.height;
        tickStroke.setAttribute('x1', 0);
        tickStroke.setAttribute('x2', 0);
        tickStroke.setAttribute('y2', 6);
        tick.setAttribute("transform", `translate(${distBetweenTicks*i}, ${TRANSLATE})`);
        tickLabel.setAttribute('x', '-1em');
        tickLabel.setAttribute('y', 9);
        tickLabel.setAttribute('dy', '0.71em');
        tickLabel.innerHTML = (ticks.ticks[i]);
        path.setAttribute('d', `M0,${TRANSLATE}h${this.width}`)
      } else {
        var distBetweenTicks = (this.height-25)/(ticks.ticks.length-1),
            TRANSLATE = 0,
            start = this.bounds[min],
            end = this.bounds[max];
        tickStroke.setAttribute('y1', 0.5);
        tickStroke.setAttribute('y2', 0.5);
        tickStroke.setAttribute('x2', -6);
        tick.setAttribute("transform", `translate(${TRANSLATE}, ${this.height - (distBetweenTicks*i)})`);
        tickLabel.setAttribute('x', -10);
        tickLabel.setAttribute('y', 0.5);
        tickLabel.setAttribute('dy', '0.31em');
        tickLabel.setAttribute('text-anchor', 'end')
        tickLabel.innerHTML = (ticks.ticks[i]);
        path.setAttribute('d', `M0,${25}v${this.height-25}`)
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
  drawLine: function() {
   var line = "M",
       marks = [],
       counter = 0;

   for(var i=0; i < this.data.length; i++) {
     var x = ((this.data[i][0].valueOf() * this.SCALEX) + this.translateX);
     var y = this.height - ((this.data[i][1] * this.SCALEY) + this.translateY);

     line += x + "," + y;
     if(i < this.data.length-1) {
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

   lineEl.setAttribute('d', line);
   lineEl.setAttribute('stroke', 'grey');
   lineEl.setAttribute('fill', 'none');
   this.elem.appendChild(lineEl);

   var xAxis = this.makeDomain();
   var yAxis = this.makeRange();
   var tick = this.addTicks(xAxis, 'x');
   var tick2 = this.addTicks(yAxis, 'y');
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
    canvasOuter.setAttribute('width', (this.width + this.margin.left + this.margin.right));
    canvasOuter.setAttribute('height', (this.height + this.margin.top + this.margin.bottom));
    canvasOuter.setAttribute('class', 'canvas');
    canvasInner.setAttribute('transform', `translate(${this.margin.right} ${this.margin.top})`)
    canvasOuter.append(canvasInner);
    this.canvas = canvasOuter;
    this.elem = canvasInner;
  },
}

module.exports = {
  Chart
}

