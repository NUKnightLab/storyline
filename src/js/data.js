var parse = require('csv-parse');

var DataFactory = function() {
}

DataFactory.prototype = {
  /**
   * runs through data and grabs significant values for drawing line
   *
   * @param {array} data - x and y axis data points
   * @param {object} config -  data object from config file
   * @returns {object} dataObj - data needed for creating a new chart
   */
  createDataObj: function(data, config) {
    var moment = require('moment');
    var output = [],
        bounds = {
          minX: null,
          maxX: null,
          minY: null,
          maxY: null
        },
        axes = {
          yLabel: null,
          timeFormat: null
        },
        markers = [];

    for(var i=0; i<data.length;i++) {
      var x = moment(data[i][config.data.datetime_column_name], config.data.datetime_format);
      var y = parseFloat(data[i][config.data.data_column_name]);
      bounds.minY = this.getMin(y, bounds.minY)
      bounds.maxY = this.getMax(y, bounds.maxY)
      bounds.minX = this.getMin(x, bounds.minX)
      bounds.maxX = this.getMax(x, bounds.maxX)
      output.push([x, y]);
      axes.timeFormat = config.chart.datetime_format;
      axes.yLabel = config.chart.y_axis_label ? config.chart.y_axis_label : config.data.data_column_name;
    }
    markers = this.getSlideMarkers(config.cards);

    var dataObj = { 'data': output, 'bounds': bounds, 'axes': axes, 'markers': markers };
    return dataObj;
  },

  /**
   * compares two values and returns the minimum
   *
   * @param {num} var1
   * @param {num} var2
   * @returns {num} smallest num of 2 given numbers
   */
  getMin: function(var1, var2) {
    if(var1 == null && var2 == null) { throw "Only one value can be null" }
    if(var1 == null) {return var2}
    if(var2 == null) {return var1}
    if(var1 < var2) {
      return var1
    } else {
      return var2
    }
  },

  /**
   * compares two values and returns the maximum
   *
   * @param var1
   * @param var2
   * @returns {undefined}
   */
  getMax: function(var1, var2) {
    if(var1 == null && var2 == null) { throw "Only one value can be null" }
    if(var1 == null) {return var2}
    if(var2 == null) {return var1}
    if(var1 > var2) {
      return var1
    } else {
      return var2
    }
  },

  /**
   * gets significant row numbers from the slides object in the dataset
   *
   * @param {object} slides - slides from config object
   * @returns {array} markers - a list of row numbers
   */
  getSlideMarkers: function(slides) {
    var markers = [];
    slides.map(function(slide, index) {
      markers.push(slide.row_number)
    })
    return markers;
  },

  /**
   * requests contents from a given csv file
   *
   * @param {string} file - name of the csv file to read
   * @returns {undefined}
   */
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

  /**
   * fetch data from the csv data using given config parameters
   *
   * @param {object} config - configuration object from json
   * @returns {undefined}
   */
  fetchData: function(config) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.get(config.data.url).then(function(response) {
        parse(response, {'columns': true}, function(err, data) {
          resolve(self.createDataObj(data, config))
        })
      })
    })
  }
}

module.exports = {
  DataFactory
}
