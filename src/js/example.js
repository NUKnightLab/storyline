function data() {
var parse = require('csv-parse');  
var XhrStream = require('xhr-stream')

  function grabNode(data, key) {
    var output = []
    for(var i=0; i<data.length;i++) {
      output.push(data[i][key])
    }
    console.log(output)
    return output;
  }

  function init() {
    var parser = parse({'columns':true}, function(err, data){
      grabNode(data, 'DOY')
    });
    var req = new XMLHttpRequest();
    req.open("GET", './assets/averageWeather2016.csv', true)
    var stream = new XhrStream(req)
    stream.pipe(parser)
  }

  return {
    grabNode: grabNode,
    init: init
  }
}

module.exports = {
  data
}

