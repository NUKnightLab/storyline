function data() {
var parse = require('csv-parse');  

  function grabNode(data, key) {
    var output = []
    for(var i=0; i<data.length;i++) {
      output.push(data[i][key])
    }
    console.log(output)
    return output;
  }

  function init() {
    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
      parse(this.responseText, {'columns': true}, function(err, data) {
        grabNode(data, 'DOY')
      })
    })
    req.open("GET", './assets/averageWeather2016.csv', true)
    req.send();
  }

  return {
    grabNode: grabNode,
    init: init
  }
}

module.exports = {
  data
}

