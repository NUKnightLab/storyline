var Chart = function(dataObj, highlightRows, width) {
    this.data = dataObj.data;
    this.bounds = dataObj.bounds;
    this.intervals = dataObj.intervals;
    this.markers = highlightRows;
    this.width = width;
    this.height = (2/3) * width
    this.getScale()
    this.elem = this.createCanvas(this.bounds);
    this.drawLine();
};

Chart.prototype = {

  getScale: function() {
    var SCALE = 10,
        AXIS_HEIGHT = 25;

    //assume bounds are moment objects//
    var rangeX = Math.abs(this.bounds.maxX.valueOf() - this.bounds.minX.valueOf());    
    var rangeY = Math.abs(this.bounds.maxY - this.bounds.minY);

    this.SCALEX = (this.width/rangeX);
    this.SCALEY = (this.height-AXIS_HEIGHT)/(rangeY);
  },
  createTicks: function() {
    var totalTick = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        g = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
        data = this.data,
        intervals = this.intervals,
        endBound = this.bounds.maxX,
        numTicks = Math.round(endBound/intervals.xTick),
        TRANSLATEY= (this.bounds.maxY + Math.abs(this.bounds.minY)) * this.SCALEY,
        maxRange,
        xLabels=[0];
   
    maxRange = numTicks*intervals.xTick * this.SCALEX;
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
      tick.setAttribute("transform", `translate(${mark*this.SCALEX}, ${TRANSLATEY})`);
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
  createMarkers: function(index, counter, translateX, translateY, rows) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    var x = ((rows[0].valueOf() * this.SCALEX) + translateX);
    var y = this.height - ((rows[1]*this.SCALEY) + translateY);
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
   var translateX = -1 * this.bounds.minX.valueOf() * this.SCALEX,
       translateY = -1 * (this.bounds.minY * this.SCALEY),
       line = "",
       marks = [],
       counter = 0;

   for(var i=0; i < this.data.length; i++) {
     var x = ((this.data[i][0].valueOf() * this.SCALEX) + translateX);
     var y = this.height - (((this.data[i][1] * this.SCALEY)) + translateY);

     line += x + " " + y;

     if(i!=this.data.length-1) {
       line += ", ";
     }

     if(this.markers.indexOf(i) >=0) {
       var mark = this.createMarkers(i, counter, translateX, translateY, this.data[i]);
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

   //var tick = this.createTicks();
   //this.elem.appendChild(tick);
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
    return canvasOuter;
  },
}

module.exports = {
  Chart
}

