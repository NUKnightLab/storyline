var d3 = {}
d3.axis = require('d3-axis');
d3.scale = require('d3-scale');
d3.selection = require('d3-selection');
d3.time = require('d3-time-format');

/**
 * Instantiate the chart component of the Storyline.
 * @constructor
 * @param {object} storyline - the Storyline instance where this chart will be shown
 * @param {object} dataObj - an object which contains all the data values and interpretation needed to render the chart. This should be created using DataFactory.
 * @param {number} width - the intended width in pixels for the chart
 * @param {number} height - the intended height in pixels for the chart
 * @param {object} margin - a JS object with `top`, `right`, `bottom`, and `left` values, each of which is a number of pixels.
 */
var Chart = function(dataObj, width, height, margin) {
    var AXIS_HEIGHT = 25;
    this.data = dataObj.data;
    this.bounds = dataObj.bounds;
    this.axes = dataObj.axes;
    this.markers = dataObj.markers;
    this.margin = margin || { 'top': 10, 'right': 30, 'bottom': 20, 'left': 30 };
    this.width = width - this.margin.right - this.margin.left;
    this.lineWidth = this.width - 40;
    this.height = height - this.margin.top - this.margin.bottom - AXIS_HEIGHT;
    this.createChart();
};

Chart.prototype = {
  createChart: function() {
    this.setRange();
    this.setScale();
    this.setTranslation();
    this.createCanvas();
    this.drawAxes(d3);
    this.drawLine();
    this.drawMarkers();
  },
  drawAxes: function(d3) {
    var self = this;
    var x = d3.scale.scaleTime()
      .domain([this.bounds.minX, this.bounds.maxX])
      .range([0, this.lineWidth]);
    var xAxis = d3.axis.axisBottom(x)
      .tickSize(this.height)
      .tickFormat(d3.time.timeFormat(this.axes.timeFormat))

    var y = d3.scale.scaleLinear()
      .domain([this.bounds.minY, this.bounds.maxY])
      .range([this.height, 0])
    var yAxis = d3.axis.axisRight(y)
      .tickSize(this.lineWidth + this.margin.right + this.margin.left)
      .tickFormat(function(d){
        if(d > 1e6) {
          d = d/1e6
        }
        return this.parentNode.nextSibling ? "\xa0" + d : d
      })

    function customXAxis(g) {
      g.call(xAxis);
      g.select(".domain").remove();
      if((window.innerWidth < 500) && (g.selectAll(".tick")._groups[0].length > 5)) {
        var numLabels = g.selectAll(".tick text")._groups[0];
        for(var i = 1; i< numLabels.length; i+=2 ) {
          numLabels[i].remove();
        }
      }
    }

    function customYAxis(g) {
      g.call(yAxis);
      g.select(".domain").remove();
      g.selectAll(".tick text").attr("dy", -4).attr("text-anchor", "end");
    }

    d3.selection.select(this.elem)
    .append("g")
    .attr("transform", "translate(0,0)")
    .call(customXAxis)

    d3.selection.select(this.elem)
      .append("g")
      .call(customYAxis)
    .append("text")
      .attr("fill", "rgb(184, 184, 184)")
      .attr("x", this.lineWidth + this.margin.right + this.margin.left)
      .attr("y", -20)
      .attr("dy", "1.75em")
      .attr("text-anchor", "end")
      .text(this.axes.yLabel);
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
    this.SCALEX = this.lineWidth/this.rangeX;
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
  /**
   * create individual significant markers on line associated with slides
   *
   * @param {num} x coord
   * @param {num} y coord
   * @param {num} counter to keep track of order of points
   * @returns {HTMLElement} <circle>
   */
  drawMarkers: function() {
    var self = this,
        markersArray = this.aggregateMarkers();

    self.textMarkers = [],
    self.markers = [];
    markersArray.map(function(marker) {
      var markerElem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      var textElem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      var connector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      circle.setAttribute('cx', marker.x);
      circle.setAttribute('cy', marker.y);
      circle.setAttribute('r', 5);
      circle.setAttribute('fill', 'grey');
      circle.setAttribute('class', 'marker-' + marker.markerCount);
      var slidertopX = (self.width+self.margin.right+self.margin.left)/2 - 30;
      var slidertopY = self.height+self.margin.bottom+1;
      connector.setAttribute('d', 'M' + marker.x + " " + marker.y + " L" + slidertopX  + " " + slidertopY);
      connector.setAttribute('fill', '#FF1744');
      text.innerHTML = marker.label;
      text.setAttribute('x', marker.x + 15);
      text.setAttribute('y', marker.y);
      text.setAttribute('fill', 'grey');
      text.setAttribute('class', 'text-' + marker.markerCount);
      markerElem.setAttribute('class', 'marker-' + marker.markerCount);
      textElem.setAttribute('class', 'text-' + marker.markerCount);

      markerElem.appendChild(connector);
      markerElem.appendChild(circle);
      textElem.appendChild(text);

      self.textMarkers.push(textElem);
      self.markers.push(markerElem);
      self.elem.appendChild(markerElem)
    })
    self.textMarkers.map(function(textItem) {
      self.elem.appendChild(textItem)
    })

  },
  /**
   * Collect data points as a string
   *
   * @returns {string} containing a stream of data points
   */
  aggregatePoints: function() {
    var line = "M";

    for(var i=0; i < this.data.length; i++) {
      var x = ((this.data[i][0].valueOf() * this.SCALEX) + this.translateX);
      var y = this.height - ((this.data[i][1] * this.SCALEY) + this.translateY);

      line += x + "," + y;
      if(i < this.data.length-1) {
        line += "L";
      }
    }
    return line;
  },
  /**
   * Collect significant markers
   *
   * @returns {array} contains significant markers as objects of data values
   */
  aggregateMarkers: function() {
    var markerArray = [],
        markerCount = 0,
        self = this;
    this.markers.map(function(marker) {
      var point, x, y, mark, label;

      point = self.data[marker]
      x = ((point[0].valueOf() * self.SCALEX) + self.translateX);
      y = self.height - ((point[1] * self.SCALEY) + self.translateY);
      label = point[1]

      mark = {
        x: x,
        y: y,
        label: label,
        markerCount: markerCount
      }

      markerArray.push(mark);
      markerCount++;
    })

    return markerArray;
  },
  /**
   * Draws the line graph and moves it based on the range so that the graph is within view
   *
   * @returns {undefined}
   */
  drawLine: function() {
   var lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');

   lineEl.setAttribute('d', this.aggregatePoints());
   lineEl.setAttribute('stroke', 'grey');
   lineEl.setAttribute('fill', 'none');
   this.elem.appendChild(lineEl);

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
