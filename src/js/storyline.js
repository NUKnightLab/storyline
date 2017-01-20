//import stuff//
var example = require('./data')
import { Chart } from './chart';
import {fetchData} from './data';

var Storyline = function(targetId, config) {
  //Chart
  var WIDTH=500;
  var HEIGHT=600;
  var self = this;
  this.container = document.getElementById(targetId);
  example.data().init(config).then(function(dataObj) {
    var data = dataObj.data;
    var bounds = dataObj.bounds;
    
    var chart = new Chart(WIDTH, HEIGHT, data, bounds);
    self.appendChart(chart);
    //Slider = new Slider();
  });
  
}
Storyline.prototype = { 
  buildSlides: function(config, targetId) {
  
  },
  appendChart: function(chart) {
    this.container.appendChild(chart.elem); 
  }
}

module.exports = {
  Storyline
}
