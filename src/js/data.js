var parse = require('csv-parse');
var Promise = require('es6-promise').Promise;

function grabNode(data, xcol, ycol, xTick, yTick) {
  var output = [],
	  bounds = {
	    minX: 0,
	    maxX: null,
	    minY: null,
	    maxY: null
      },
      intervals = {
        xTick: null,
        yTick: null
      }

  for(var i=0; i<data.length;i++) {
    var x = data[i][xcol];
    var y = parseFloat(data[i][ycol]);
    bounds.minY = checkMin(y, bounds.minY)
    bounds.maxY = checkMax(y, bounds.maxY)
    bounds.maxX = data.length;
    output.push([x, y]);
    intervals.xTick = xTick;
    intervals.yTick = yTick;
  }
  var obj = { 'data': output, 'bounds': bounds, 'intervals': intervals };
  return obj;
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

function get(file) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open("GET", file, true)
    req.onload = function() {
      if(req.status == 200) {
        resolve(req.response);
      } else {
        reject(Error(req.statusText));
      }
    }
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    req.send();
  });
}

function fetchData(config) {
  return new Promise(function(resolve, reject) {
    get(config.data).then(function(response) {
      parse(response, {'columns': true}, function(err, data) {
        resolve(grabNode(data, config.xAxis, config.yAxis, config.xTickInterval, config.yTickInterval))
      })
    })
  })
}

export {fetchData}
