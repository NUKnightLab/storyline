var parse = require('csv-parse');
import {lib} from './lib'

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
    var d3Time = require('d3-time-format');
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

    var i=0;
    while(i < data.length) {
      var dateParse = d3Time.timeParse(config.data.datetime_format);
      var x = dateParse(data[i][config.data.datetime_column_name]);
      var y = parseFloat(data[i][config.data.data_column_name]);
      //check if x or y is undefined or null
      if(!x || !y) {
        var errorMessage = "";
        errorMessage = isNaN(parseInt(x)) ? "x axis is invalid, check that your x axis column name is correct" : errorMessage
        errorMessage = isNaN(parseInt(y)) ? "y axis is invalid, check that your y axis column name is correct" : errorMessage
        return lib.errorLog({errorMessage})
        break;
      }
      bounds.minY = this.getMin(y, bounds.minY)
      bounds.maxY = this.getMax(y, bounds.maxY)
      bounds.minX = this.getMin(x, bounds.minX)
      bounds.maxX = this.getMax(x, bounds.maxX)
      output.push([x, y]);
      axes.timeFormat = config.chart.datetime_format;
      axes.yLabel = config.chart.y_axis_label ? config.chart.y_axis_label : config.data.data_column_name;

      i++;
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
  getCSV: function(context) {
    let file = context ? context.data.url : undefined
    return lib.parseSpreadsheetURL(file)
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
      var parts = self.getCSV(config)
      var url = "https://spreadsheets.google.com/feeds/list/" + parts.key + "/1/public/values?alt=json"
      lib.get(url)
        .then(function(response) {
          var data = JSON.parse(response)
          var headers = self.getColumnHeaders(data.feed.entry[0])
          resolve(self.createDataFromSheet(data, headers, config))
        }, function(reason) {
          self.errorMessage = reason
          self.errorLog()
        })
    })
  },

  createDataFromSheet: function(data, headers, config) {
    var d3Time = require('d3-time-format');
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
    for(var i=0; i<data.feed.entry.length;i++) {
    var date = data.feed.entry[i]["gsx$" + config.data.datetime_column_name.replace(/\s/g, '').toLowerCase()].$t
    var dateParse = d3Time.timeParse(config.data.datetime_format)
    var x = dateParse(date)
    var y = data.feed.entry[i]["gsx$" + config.data.data_column_name.replace(/\s/g, '').toLowerCase()].$t
      bounds.minY = this.getMin(y, bounds.minY)
      bounds.maxY = this.getMax(y, bounds.maxY)
      bounds.minX = this.getMin(x, bounds.minX)
      bounds.maxX = this.getMax(x, bounds.maxX)
      output.push([x, y]);
      axes.timeFormat = config.chart.datetime_format;
      axes.yLabel = config.chart.y_axis_label ? config.chart.y_axis_label : config.data.data_column_name;
    }
debugger;
  },

  getColumnHeaders: function(obj) {
    var reg = /gsx\$([^]+)/g
    var all = Object.keys(obj).join(" ");
    var headers = all.match(reg)
    return headers[0].replace(/gsx\$/g, '').split(" ")
  },

  errorLog: function() {
    var mustache = require('mustache');
     const template =
       "<div class='error'>" +
       "<h3><span class='error-message'>{{ errorMessage }}</span></h3>" +
       "</div>"
     var rendered = mustache.render(template, this),
         parser = new DOMParser(),
         doc = parser.parseFromString(rendered, "text/html");

     storyline.elem.append(doc.body.children[0])
  }
}

module.exports = {
  DataFactory
}
