var example = require('./data')
var thing = require('./chart')
var Promise = require('es6-promise').Promise;

window.onload = function() {
  //promise?
  var data = example.data().init();
  var Chart1 = new thing.Chart().dimensions(500, 600, data, null)
}
