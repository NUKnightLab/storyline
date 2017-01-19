var example = require('./data')
import { Chart } from './chart';
var thing = require('chart');

window.onload = function() {
  var Chart1, Canvas;

  example.data().init().then(function(someVal) {
    Chart1 = new Chart.dimensions(1000, 1000, someVal, null);
    Canvas = new Chart.createCanvas(5000, 1000, 'graph');
    for(var i=1; i < someVal.length; i++) {
      var val2 = someVal[i];
      var val1 = someVal[i-1];
      thing = new Chart.createLine(val1[0], val1[1], val2[0], val2[1], 'red', 1);
      Canvas.childNodes[0].appendChild(thing)
    }
  })
}
