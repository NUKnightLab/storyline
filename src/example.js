export function data() {
  var parse = require('csv-parse');  
  var fs = require('graceful-fs');

  function readCSV(file) {
    var parser = parse({'columns':true}, function(err, data) {
      grabNode(data, 'DOY');
    });

    fs.createReadStream(file).pipe(parser)
  }

  function grabNode(data, key) {
    var output = []
    for(var i=0; i<data.length;i++) {
      output.push(data[i][key])
    }
    return output;
  }

  return {
    readCSV: readCSV,
    grabNode: grabNode
  }

}

