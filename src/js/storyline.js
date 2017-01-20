import { Chart } from './chart';
import {fetchData} from './data';

var Storyline = function(targetId, config) {
  //Chart
  var WIDTH=500;
  var HEIGHT=600;
  var self = this;
  //grab markers//
  //this.highlightedRows = //
  this.container = document.getElementById(targetId);
  (fetchData(config)).then(function(dataObj) {
    var data = dataObj.data;
    var bounds = dataObj.bounds;
    
    var chart = new Chart(WIDTH, HEIGHT, data, bounds, self.highlightedRows);
    self.appendChart(chart);
    //Slider = new Slider();
  });
  
}
Storyline.prototype = { 
  buildSlides: function(config, targetId) {
    config 
  },
  appendChart: function(chart) {
    this.container.appendChild(chart.elem); 
  }
}

module.exports = {
  Storyline
}
