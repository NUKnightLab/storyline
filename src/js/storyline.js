import { Chart } from './chart';
import { fetchData } from './data';
import { Slider } from './slider';

var Storyline = function(targetId, config) {
  //Chart
  var WIDTH=500;
  var HEIGHT=600;
  var self = this;
  var slider = new Slider(config.slides);
  this.container = document.getElementById(targetId);

  (fetchData(config)).then(function(dataObj) {
    var data = dataObj.data,
        bounds = dataObj.bounds,
        intervals = dataObj.intervals,
        highlightedRows = slider.highlightRows();

    var chart = new Chart(data, bounds, intervals, highlightedRows);
    self.appendChart(chart);
    self.appendSlider(slider.createSlider());
  });
}
Storyline.prototype = { 
  buildSlides: function(config, targetId) {
    config 
  },
  appendChart: function(chart) {
    this.container.appendChild(chart.elem); 
  },
  appendSlider: function(slider) {
    this.container.appendChild(slider);
  }
}

module.exports = {
  Storyline
}
