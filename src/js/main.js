var example = require('./data')
import { Chart } from './chart';

window.onload = function() {
  var Chart1;

  example.data().init().then(function(someVal) {
    Chart1 = new Chart.dimensions(500, 600, someVal, null);
    console.log(Chart1);
  })
}
