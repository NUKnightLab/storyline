var example = require('./data')
import { Chart } from './chart';
var thing = require('chart');

window.onload = function() {
  var Chart1, Canvas;

  example.data().init().then(function(dataObj) {
    var data = dataObj.data;
    var bounds = dataObj.bounds;
    var bufferX = 0, bufferY = 0;
    Chart1 = new Chart.dimensions(500, 600, data, null);
    Canvas = new Chart.createCanvas(5000, 1000, 'graph');
    //account for negatives by shifting axes over in the positive direction//
    if(bounds.minX < 0) {
      bufferX = - bounds.minX;
    } else if(bounds.minY < 0) {
      bufferY = - bounds.minY;
    }
    for(var i=1; i < data.length; i++) {
      var val2 = data[i];
      var val1 = data[i-1];
      thing = new Chart.createLine(val1[0], val1[1], val2[0], val2[1], 'red', 1, bufferX, bufferY, 10);
      Canvas.childNodes[0].appendChild(thing)
    }
  })
}
