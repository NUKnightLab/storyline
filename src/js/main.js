var example = require('./data')
var thing = require('./chart')

window.onload = function() {
  var Chart1 = new thing.Chart()

  example.data().init().then(function(someVal) {
    Chart1.dimensions(500, 600, someVal, null);
  })
}
