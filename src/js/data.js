var parse = require('csv-parse/lib/sync');
import {lib} from './lib'

var DataFactory = function() {
  this.storyline = {elem: document.querySelector('#Storyline')}
}

/**
 * Simple function to convert a config value into a Google Spreadsheet row key,
 * and verify that it's valid for given row before getting deeper into the data.
 *
 * @param {string} config_column_name - a value as specified in a storymap config
 * @param {object} testRow - a row from reading the google spreadsheet which is expected to have this column
 */
function constructAndTestGSXColumn(config_column_name, testRow) {
  var col_name = "gsx$" + config_column_name.replace(/\s/g, '').toLowerCase();
    if (!testRow[col_name]) {
      throw {message:"Missing column [" + config_column_name + "]" }
    }
    return col_name;

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
   * requests contents from a given csv file (@TODO or Google spreadsheet? only Google spreadsheet?)
   *
   * @param {string} file - name of the csv file to read
   * @returns {string} the URL to a Google Spreadsheet or a CSV or undefined if various conditions aren't met
   */
  getCSVPath: function(context) {
    // this should throw an exception if context is undefined since the immediate next line would throw an error.
    // also consider passing exactly the parameter which is needed for clarity instead of the whole context
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
  fetchSheetHeaders: function(config, context) {
    var self = context ? context : this;
    return new Promise(function(resolve, reject) {
      var url = self.getCSVPath(config) // url could be undefined. handle more deliberately.
      lib.get(url)
        .then(function(response) {
          if(response) {
            var formattedResponse, headers;
            try {
              formattedResponse = JSON.parse(response).feed.entry
            } catch(e) {
              //downcase headers//
              response = response.replace(response.split(/\n/)[0], response.split(/\n/)[0].toLowerCase())
              formattedResponse = parse(response, {'columns': true})
            } finally {
              try {
                headers = self.getAllColumnHeaders(config, formattedResponse[0])
                resolve({headers, formattedResponse})
              } catch(e) {
                self.errorMessage = e.message
                self.errorLog()
                reject(new Error(e.message))
              }
            }
          }
        }, function(reason) {
          self.errorMessage = reason
          self.errorLog()
        })
    })
  },
  fetchSheetData: function(config, context) {
    var self = context ? context : this;
    return new Promise(function(resolve, reject) {
      var url = self.getCSVPath(config)
      lib.get(url)
        .then(function(response) {
          if(response) {
            var formattedResponse, headers;
            try {
              formattedResponse = JSON.parse(response).feed.entry
            } catch(e) {
              //downcase headers//
              response = response.replace(response.split(/\n/)[0], response.split(/\n/)[0].toLowerCase())
              formattedResponse = parse(response, {'columns': true})
            } finally {
              try {
                if(!self.hasColumnHeaders(config)) {
                  headers = self.getAllColumnHeaders(config, formattedResponse[0])
                }
                resolve(self.createDataFromSheet(formattedResponse, headers, config))
              } catch(e) {
                self.errorMessage = e.message
                self.errorLog()
                reject(new Error(e.message))
              }
            }
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


    var gsx_data_column_name = constructAndTestGSXColumn(config.data.data_column_name, dataFeed[0]);
    var gsx_datetime_column_name = constructAndTestGSXColumn(config.data.datetime_column_name, dataFeed[0]);
    var gsx_title_column_name = (config.cards.title) ? constructAndTestGSXColumn(config.cards.title, dataFeed[0]) : null;
    var gsx_text_column_name = (config.cards.text) ? constructAndTestGSXColumn(config.cards.text, dataFeed[0]) : null;

    var card_lookup = null;
    if (!(gsx_title_column_name && gsx_text_column_name)) {
      // assume that the cards are passed in using the original format
      card_lookup = {}
      for (var i = 0; i < config.cards.length; i++) {
        var card = config.cards[i];
        card_lookup[card.row_number] = card;
      }
    }

    for(var i=0; i<dataFeed.length;i++) {
      var slideTitle = '', slideText = '', slideActive = false;
      if (!card_lookup) {
        slideTitle = dataFeed[i][gsx_title_column_name].$t
        slideText = dataFeed[i][gsx_text_column_name].$t
        slideActive = (dataFeed[i]["gsx$slideactive"]) ? dataFeed[i]["gsx$slideactive"].$t : false;
      } else if (card_lookup[i]) {
        slideTitle = card_lookup[i].title;
        slideText = card_lookup[i].text;
        if (config.start_at_card) {
          slideActive = (config.start_at_card == i);
        }
      }
      var date = dataFeed[i][gsx_datetime_column_name].$t
      var dateParse = d3Time.timeParse(config.data.datetime_format)
      var x = dateParse(date)
      var y = dataFeed[i][gsx_data_column_name].$t
      y = parseFloat(y)
        bounds.minY = this.getMin(y, bounds.minY)
        bounds.maxY = this.getMax(y, bounds.maxY)
        bounds.minX = this.getMin(x, bounds.minX)
        bounds.maxX = this.getMax(x, bounds.maxX)
        data.push([x, y]);
        axes.timeFormat = config.chart.datetime_format || '%y';
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

  hasColumnHeaders: function(config) {
    var hasxCol = config.data.datetime_column_name && config.data.datetime_column_name.length > 0;
    var hasyCol = config.data.data_column_name && config.data.data_column_name.length > 0
    return (hasxCol && hasyCol)
  },

  /**
   * Extract the available column headers to use in offering choices to users in the GUI.
   * Currently assumes Google Spreadsheet.
   * @param {object} config - not currently used
   * @param {object} obj - a typical "row" from the Google Spreadsheet which has column names
   */
  getAllColumnHeaders: function(config, obj) {
    var formattedHeaders = [];
    var reg = /gsx\$([^]+)/g
    var all = Object.keys(obj).join(" ");
    var headers = all.match(reg)
    headers = headers[0].replace(/gsx\$/g, '').split(" ")
    //var xCol = config.data.datetime_column_name.replace(/\s/g, '').toLowerCase()
    //var yCol = config.data.data_column_name.replace(/\s/g, '').toLowerCase()
    //headers.indexOf(xCol) >= 0 ? xCol : (function() {throw new Error('Error column doesn\'t exist')}())
    //headers.indexOf(yCol) >= 0 ? yCol : (function() {throw new Error('Error column doesn\'t exist')}())
    //return {xCol, yCol}
    return headers
  },

  errorLog: function() {
    if (this.storyline.elem) {
      var mustache = require('mustache');
       const template =
         "<div class='error'>" +
         "<h3><span class='error-message'>{{ errorMessage }}</span></h3>" +
         "</div>"
       var rendered = mustache.render(template, this),
           parser = new DOMParser(),
           doc = parser.parseFromString(rendered, "text/html");

       this.storyline.elem.append(doc.body.children[0])
    } else {
      console.warn("data.js errorLog: no storyline element available for logging");
      console.error(this.errorMessage);

    }
  }
}

module.exports = {
  DataFactory
}
