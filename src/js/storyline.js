import { Chart } from './chart';
import { DataFactory } from './data';
import { Slider } from './slider';

var Storyline = function(targetId, dataConfig) {
  this.elem = document.getElementById(targetId);
  var self = this;
  if (typeof dataConfig == 'string') {
    var req = new XMLHttpRequest;
    req.addEventListener("load", function() {
      var config = JSON.parse(this.responseText);
      self.dataConfig = config;
      self.init();
    });
    // TODO: add error handling to request
    req.open("GET", dataConfig);
    req.send();
  } else {
    this.dataConfig = dataConfig;
    this.init();
  }
}

Storyline.prototype = {
  init: function() {
    var self = this;
    this.setDimensions();
    this.slider = this.initSlider();
    this.grabData(this.dataConfig).then(function(dataObj) {
      self.data = dataObj;
      self.chart = self.initChart(dataObj);
      self.positionChart(self.chart)
      self.positionSlider(self.slider)
    });
    PubSub.subscribe('window resized', function(topic, data) {
      self.resetWidth(data);
    })
  },
  resetWidth: function(newWidth) {
    this.width = newWidth;
    var oldSlider = this.slider.elem
    var oldChart = this.chart.canvas
    oldSlider.remove();
    oldChart.remove();
    this.slider = this.initSlider();
    this.chart = this.initChart(this.data)
    this.positionChart(this.chart)
    this.positionSlider(this.slider)
  },
  grabData: function() {
    var data = new DataFactory;
    return data.fetchData(this.dataConfig);
  },
  initSlider: function() {
    var sliderHeight = (0.4*this.height)
    return new Slider(this.dataConfig.cards, this.dataConfig.start_at_card, sliderHeight);
  },
  initChart: function(dataObj) {
    //chart height//
    var chartHeight = (0.6*this.height);
    return new Chart(dataObj, this.width, chartHeight, this.margin)
  },
  /**
   * checks browser size and if mobile, overrides input dimensions
   *
   * @returns {undefined}
   */
  setDimensions: function(width) {
    this.height = this.elem.getAttribute('height');
    //this.elem.style.height = this.height + "px";
    this.width = width ? width : window.innerWidth;
    //this.elem.style.width = this.width + "px";
  },
  attr: function(dimension, value) {
    if(dimension == "height") {
      this.height = value;
      this.elem.style.height = value + "px";
    } else if(dimension == "width") {
      this.width = value;
      this.elem.style.width = value + "px";
    } else if(dimension == "margin") {
      this.margin = value;
    }
  },
  positionChart: function(chart) {
    this.elem.appendChild(chart.canvas);
    //chart.setWidth(this.width)
  },
  positionSlider: function(slider) {
    this.elem.appendChild(slider.elem);
    slider.setWidth(this.width)
    slider.setTrayPosition();
    slider.attachClickHandler(this.chart.markers);
    slider.elem.style.opacity = 1;
  }
}

module.exports = {
  Storyline
}
