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
    var data = [],
        activeSlide,
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
      data.push([x, y]);
      axes.timeFormat = config.chart.datetime_format;
      axes.yLabel = config.chart.y_axis_label ? config.chart.y_axis_label : config.data.data_column_name;

      i++;
    }
    markers = this.getSlideMarkers(config.cards);

    var dataObj = { data, bounds, axes, markers, activeSlide };
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
  getSlideMarkers: function(rowNum, slideTitle, slideText) {
    return {rowNum, slideTitle, slideText};
  },

  /**
   * requests contents from a given csv file
   *
   * @param {string} file - name of the csv file to read
   * @returns {undefined}
   */
  getCSV: function(context) {
    let url = context ? context.data.url : undefined
    if (url.substring(0,4) == 'http') {
      var parts = lib.parseSpreadsheetURL(url)
      return "https://spreadsheets.google.com/feeds/list/" + parts.key + "/1/public/values?alt=json"
    };
    if(url.substring(url.length - 3) == 'csv') {return url}
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
      var url = self.getCSV(config)
      lib.get(url)
        .then(function(response) {
          try {
            var data = JSON.parse(response).feed.entry
            var headers = self.getColumnHeaders(data[0])
            resolve(self.createDataFromSheet(data, headers, config))
          } catch(e) {
            //downcase headers//
            response = response.replace(response.split(/\n/)[0], response.split(/\n/)[0].toLowerCase())
            parse(response, {'columns': true}, function(err, data) {
              resolve(self.createDataObj(data, config))
            })
          }
        }, function(reason) {
          self.errorMessage = reason
          self.errorLog()
        })
    })
  },

  createDataFromSheet: function(dataFeed, headers, config) {
    var d3Time = require('d3-time-format');
    var data = [],
        activeSlide,
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
        activeSlide,
        markers = [];
    for(var i=0; i<dataFeed.length;i++) {
      var slideTitle = dataFeed[i]["gsx$slidetitle"].$t
      var slideText = dataFeed[i]["gsx$slidetext"].$t
      var slideActive = dataFeed[i]["gsx$slideactive"].$t
      var date = dataFeed[i]["gsx$" + config.data.datetime_column_name.replace(/\s/g, '').toLowerCase()].$t
      var dateParse = d3Time.timeParse(config.data.datetime_format)
      var x = dateParse(date)
      var y = dataFeed[i]["gsx$" + config.data.data_column_name.replace(/\s/g, '').toLowerCase()].$t
      y = parseFloat(y)
        bounds.minY = this.getMin(y, bounds.minY)
        bounds.maxY = this.getMax(y, bounds.maxY)
        bounds.minX = this.getMin(x, bounds.minX)
        bounds.maxX = this.getMax(x, bounds.maxX)
        data.push([x, y]);
        axes.timeFormat = config.chart.datetime_format;
        axes.yLabel = config.chart.y_axis_label ? config.chart.y_axis_label : config.data.data_column_name;
      if(slideTitle.length > 0 || slideText.length > 0) {
        if(slideActive) {
          activeSlide = markers.length
        }
        markers.push(this.getSlideMarkers(i, slideTitle, slideText));
      }
    }

    var dataObj = { data, bounds, axes, markers, activeSlide };
    return dataObj;
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
