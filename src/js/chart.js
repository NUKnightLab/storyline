var Chart = function(dataObj, width, height, margin) {
    var AXIS_HEIGHT = 25;
    this.data = dataObj.data;
    this.bounds = dataObj.bounds;
    this.axes = dataObj.axes;
    this.markers = dataObj.markers;
    this.margin = margin || { 'top': 30, 'right': 50, 'bottom': 30, 'left': 20 };
    this.width = width - this.margin.right - this.margin.left;
    this.height = height - this.margin.top - this.margin.bottom - AXIS_HEIGHT;
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
    this.SCALEX = this.width/this.rangeX;
    this.SCALEY = this.height/this.rangeY;
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
  makeDomain: function(label) {
    var start = this.bounds.minX[label.toLowerCase()](),
        end = this.bounds.maxX[label.toLowerCase()]();

    return {
      start: start,
      end: end
    }
  },
  /**
   * Creates an object of the range, including array of ticks, and y axis label
   *
   * @returns {object}
   */
  makeRange: function() {
    var start = this.bounds.minY,
        end = this.bounds.maxY;

    return {
      start: start,
      end: end
    }
  },
  makeAxis: function(axis) {
    var label = this.axes[`${axis}Label`],
        interval = this.axes[`${axis}Tick`] || 1,
        bounds = (axis === 'x') ? this.makeDomain(label) : this.makeRange(),
        numTicks = (bounds.end - bounds.start)/interval,
        ticks = this.createTicks(bounds.start, bounds.end, interval);

    //addTicks here//

    return {
      label: label,
      ticks: ticks,
      numTicks: numTicks
    }
  },
  makeTickStroke: function(x1, x2, y1, y2) {
    var tickStroke = document.createElementNS('http://www.w3.org/2000/svg', 'line'),
        coords = {
          'x1': x1,
          'x2': x2,
          'y1': y1,
          'y2': y2
        };

    tickStroke.setAttribute('stroke', 'black');
    for (var value in coords) {
      if(coords[value]!= undefined) {
        tickStroke.setAttribute(value, coords[value])
      }
    }
    return tickStroke;
  },
  makeTick: function(tickDist, translate) {
    var tick = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    tick.setAttribute("transform", `translate(${tickDist}, ${translate})`);
    return tick;
  },
  makeTickLabel: function(x, y, dy, label) {
    var tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    tickLabel.setAttribute('x', x);
    tickLabel.setAttribute('y', y);
    tickLabel.setAttribute('dy', (dy + 'em'));
    tickLabel.innerHTML = label;

    return tickLabel
  },
  addTicks: function(ticks, axis) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    g.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#000');

    for(var i=0; i<ticks.ticks.length; i++) {
      var tick,
          tickStroke,
          tickLabel,
          min = `min${axis.toUpperCase()}`,
          max = `max${axis.toUpperCase()}`;

      if(axis === 'x') {
        var distBetweenTicks = (this.width/ticks.numTicks) * i;

        tickStroke = this.makeTickStroke(0, 0, null, 6);
        tick = this.makeTick(distBetweenTicks, this.height);
        tickLabel = this.makeTickLabel(-16, 9, 0.71, ticks.ticks[i])
        path.setAttribute('d', `M0,${this.height}h${this.width}`)
      } else {
        var distBetweenTicks = ((this.height)/(ticks.ticks.length-1)) * i,
            TRANSLATE = 0,
            start = this.bounds[min],
            end = this.bounds[max];
        tickStroke = this.makeTickStroke(null, -6, 0.5, 0.5)
        tick = this.makeTick(0, distBetweenTicks) //.setAttribute("transform", `translate(${TRANSLATE}, ${this.height - (distBetweenTicks*i)})`);
        tickLabel = this.makeTickLabel(-10, 0.5, 0.31, ticks.ticks[i])
        tickLabel.setAttribute('text-anchor', 'end')
        path.setAttribute('d', `M0,${25}v${this.height-25}`)
      }
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
       markerArray = [],
       markerCounter = 0,
       lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');

   for(var i=0; i < this.data.length; i++) {
     var x = ((this.data[i][0].valueOf() * this.SCALEX) + this.translateX);
     var y = this.height - ((this.data[i][1] * this.SCALEY) + this.translateY);

     line += x + "," + y;
     if(i < this.data.length-1) {
       line += "L";
     }

     //while looping through data grab significant data points for markers//
     if(this.markers.indexOf(i) >=0) {
       var mark = this.createMarkers(x, y, markerCounter);
       markerCounter++;
       markerArray.push(mark);
       this.elem.appendChild(mark);
     }
   }

   this.markers = markerArray;

   lineEl.setAttribute('d', line);
   lineEl.setAttribute('stroke', 'grey');
   lineEl.setAttribute('fill', 'none');
   this.elem.appendChild(lineEl);

   var xAxis = this.makeAxis('x');
   var yAxis = this.makeAxis('y');
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

