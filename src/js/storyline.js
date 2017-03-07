import { Chart } from './chart';
import { DataFactory } from './data';
import { Slider } from './slider';

var Storyline = function(targetId, dataConfig) {
  this.elem = document.getElementById(targetId);
  this.dataConfig = dataConfig;
  this.init();
}

Storyline.prototype = {
  init: function() {
    var self = this;
    this.setDimensions();
    this.slider = this.initSlider();
    this.grabData(this.dataConfig).then(function(dataObj) {
      self.chart = self.initChart(dataObj);
      self.positionChart(self.chart)
      self.positionSlider(self.slider)
    });
    //PubSub.subscribe('window resized', function(topic, data) {
    //  self.checkScreenSize();
    //})
  },
  grabData: function() {
    var data = new DataFactory;
    return data.fetchData(this.dataConfig);
  },
  initSlider: function() {
    return new Slider(this.dataConfig.slides, this.dataConfig.startIndex);
  },
  initChart: function(dataObj) {
    return new Chart(dataObj, this.width, this.height, this.margin)
  },
  /**
   * checks browser size and if mobile, overrides input dimensions
   *
   * @returns {undefined}
   */
  setDimensions: function(width) {
    this.height = this.elem.getAttribute('height');
    this.elem.style.height = this.height + "px";
    this.width = width ? width : window.innerWidth;
    this.elem.style.width = this.width + "px";
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
