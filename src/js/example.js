function data() {
	var parse = require('csv-parse');

  function grabNode(data, keyArray) {
    var output = [],
		bounds = {
		  minX: null,
		  maxX: null,
		  minY: null,
		  maxY: null
		},
    	xcol = keyArray[0],
		ycol = keyArray[1];
    for(var i=0; i<data.length;i++) {
     //TODO: parse strings, collect bounds//	  
	  var x = parseFloat(data[i][xcol]);
	  var y = parseFloat(data[i][ycol]); 
	  bounds.minX = checkMin(x, bounds.minX)
	  bounds.maxX = checkMax(x, bounds.maxX)
	  bounds.minY = checkMin(y, bounds.minY)
	  bounds.maxY = checkMax(y, bounds.maxY)
      output.push([x, y]);
    }
    console.log(bounds)
	console.log(output)
    return output;
  }

  function checkMin(var1, var2) {
    if(var1 == null && var2 == null) { throw "Only one value can be null" }
    if(var1 == null) {return var2} 
    if(var2 == null) {return var1} 
	return Math.min(var1, var2)
  }
  
  function checkMax(var1, var2) {
    if(var1 == null && var2 == null) { throw "Only one value can be null" }
    if(var1 == null) {return var2} 
    if(var2 == null) {return var1} 
	return Math.max(var1, var2)
  }

  function init() {
    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
      parse(this.responseText, {'columns': true}, function(err, data) {
        grabNode(data, ['DOY', 'AT'])
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

