var example = require('./data')
var thing = require('./chart')
var Promise = require('es6-promise').Promise;

window.onload = function() {
  //promise?
  var thing = example.data().init();
  example.data().init().then(function(someVal) {
    console.log(someVal);
  })
  //var Chart1 = new thing.Chart().dimensions(500, 600, data, null)
}
