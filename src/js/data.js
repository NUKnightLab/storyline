var parse = require('csv-parse');
var Promise = require('es6-promise').Promise;

var DataFactoryFunc = function() {
}

DataFactoryFunc.prototype = {
  grabData: function(data, config) {
    var moment = require('moment');
    var output = [],
        bounds = {
          minX: null,
          maxX: null,
          minY: null,
          maxY: null
        },
        axes = {
          xTick: null,
          yTick: null,
          xAxis: null,
          yAxis: null
        },
        markers = [];

    for(var i=0; i<data.length;i++) {
      var x = moment(data[i][config.xAxis], config.dateFormat);
      var y = parseFloat(data[i][config.yAxis]);
      bounds.minY = this.checkMin(y, bounds.minY)
      bounds.maxY = this.checkMax(y, bounds.maxY)
      bounds.minX = this.checkMin(x, bounds.minX)
      bounds.maxX = this.checkMax(x, bounds.maxX)
      output.push([x, y]);
      axes.xTick = config.xTickInterval;
      axes.yTick = config.yTickInterval;
      axes.xLabel = config.xLabel;
      axes.yLabel = config.yLabel;
    }
    markers = this.getSlideMarkers(config.slides);

    var obj = { 'data': output, 'bounds': bounds, 'axes': axes, 'markers': markers };
    return obj;
  },

  checkMin: function(var1, var2) {
    if(var1 == null && var2 == null) { throw "Only one value can be null" }
    if(var1 == null) {return var2}
    if(var2 == null) {return var1}
    if(var1 < var2) {
      return var1
    } else {
      return var2
    }
  },

  checkMax: function(var1, var2) {
    if(var1 == null && var2 == null) { throw "Only one value can be null" }
    if(var1 == null) {return var2}
    if(var2 == null) {return var1}
    if(var1 > var2) {
      return var1
    } else {
      return var2
    }
  },

  getSlideMarkers: function(slides) {
    var markers = [];
    slides.map(function(slide) {
      markers.push(slide.rowNum)
    })
    return markers;
  },

  get: function(file) {
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
  },

  fetchData: function(config) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.get(config.data).then(function(response) {
        parse(response, {'columns': true}, function(err, data) {
          resolve(self.grabData(data, config))
        })
      })
    })
  }
}

module.exports = {
  DataFactoryFunc
}
