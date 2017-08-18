var parse = require('csv-parse/lib/sync');
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
  createDataObj: function(dataObj, config) {
    var d3Time = require('d3-time-format');
    var data = [],
        cards = [],
        activeCard,
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

    var card_lookup = null;
    if (config.slider.cards != undefined) {
      card_lookup = {}
      for (var i = 0; i < config.slider.cards.length; i++) {
        var card = config.slider.cards[i];
        card_lookup[card.row_number] = card;
      }
    } else {
      var errorMsg = [];
      if (!config.slider.title_column_name) {
        errorMsg.push("No title column specified.");
      }
      if (!config.slider.text_column_name) {
        errorMsg.push("No text column specified.");
      }
      if (errorMsg.length > 0) {
        throw new Error(errorMsg.join('\n'));
      }
    }

    for(var i=0; i<dataObj.length; i++) {
      var slideTitle = '', slideText = '', slideActive = false;
      if (!card_lookup) {
        try {
          slideTitle = dataObj[i][config.slider.title_column_name].$t
        } catch(e) {
          throw new Error("Invalid title column.")
        }
        try {
          slideText = dataObj[i][config.slider.text_column_name].$t
        } catch(e) {
          throw new Error("Invalid text column.")
        }
        slideActive = (dataObj[i][config.slider.start_at_card]) ? dataObj[i][config.slider.start_at_card].$t : false;
      } else if (card_lookup[i]) {
        slideTitle = card_lookup[i].title;
        slideText = card_lookup[i].text;
        if (config.slider.start_at_card) {
          slideActive = (config.slider.start_at_card == i);
        }
      }
      var dateParse = d3Time.timeParse(config.data.datetime_format);
      var x = dataObj[i][config.data.datetime_column_name]
      var y = dataObj[i][config.data.data_column_name];
      x = typeof x === typeof {} ? dateParse(Object.values(x)[0]) : dateParse(x);
      y = typeof y === typeof {} ? parseFloat(Object.values(y)[0]) : parseFloat(y);
      //check if x or y is undefined or null

      if(!x || !y) {
        var errorMessage = "";
        // TODO: if both are wrong, report both instead of overriding one error with the other.
        errorMessage = isNaN(parseInt(x)) ? "The date/time column is invalid, check that the column name matches your data" : errorMessage
        errorMessage = isNaN(parseInt(y)) ? "The data column is invalid, check that the column name matches your data" : errorMessage
        throw new Error(errorMessage);
      }
      bounds.minY = this.getMin(y, bounds.minY)
      bounds.maxY = this.getMax(y, bounds.maxY)
      bounds.minX = this.getMin(x, bounds.minX)
      bounds.maxX = this.getMax(x, bounds.maxX)
      data.push([x, y]);
      axes.timeFormat = config.chart.datetime_format;
      axes.yLabel = config.chart.y_axis_label ? config.chart.y_axis_label : config.data.data_column_name;

      if (!slideTitle) throw new Error("No slide title?")
      if (!slideText) throw new Error("No slide text?")
      if(slideTitle.length > 0 && slideText.length > 0) {
        var displayDate = x
        var rowNumber = i
        cards.push({displayDate, slideTitle, slideText, rowNumber})
        markers.push({rowNumber, displayDate, slideTitle, slideText})
      }
    }

    var dataObj = { data, cards, bounds, axes, markers, activeCard };
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
                headers = self.getAllColumnHeaders(formattedResponse[0])
                resolve({headers, formattedResponse})
              } catch(e) {
                reject(e);
              }
            }
          }
        }, function(reason) {
          reject(reason);
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
                if(self.dataisinGSX(config, formattedResponse[0])) {
                  config = self.setColumnHeadersToGSX(config)
                }
                resolve(self.createDataObj(formattedResponse, config))
              } catch(e) {
                if (!e.message) {
                  e = { message: e };
                }
                reject(e) // leave error handling to promise caller
              }
            }
          }
        }, function(reason) {
          reject(reason);  // leave error handling to promise caller
        })
    })
  },

  /**
   * checks that the headers match the response headers
   *
   * @param {Object} config
   * @param {Object} response
   * @returns {Boolean}
   */
  dataisinGSX: function(config, response) {
    var isDatetimeColinGSX = !!response["gsx$" + config.data.datetime_column_name.replace(/\s+/g, '').toLowerCase()];
    var isDataColinGSX = !!response["gsx$" + config.data.data_column_name.replace(/\s+/g, '').toLowerCase()]
    return (isDatetimeColinGSX && isDataColinGSX)
  },

  /**
   * Extract the available column headers to use in offering choices to users in the GUI.
   * Currently assumes Google Spreadsheet.
   * @param {object} config - not currently used
   * @param {object} obj - a typical "row" from the Google Spreadsheet which has column names
   */
  getAllColumnHeaders: function(response) {
    var formattedHeaders = [];
    var reg = /gsx\$([^]+)/g
    var all = Object.keys(response).join(" ");
    var headers = all.match(reg)[0].split(" ")
    return headers
  },

  setColumnHeadersToGSX: function(config) {
    let configSubset = null;
    if(config.slider.cards != undefined) {
      //need to refactor//
      configSubset = { data: config.data }
    } else {
      configSubset = { data: config.data, slider: config.slider }
    }
    let formattedConfig = {}
    for(var key in configSubset) {
      let formattedHeaders = {}
      Object.keys(configSubset[key]).map(function(header) {
        if(header === 'url' || header === 'datetime_format') {
          formattedHeaders[header] = configSubset[key][header]
        } else {
          formattedHeaders[header] = "gsx$" + configSubset[key][header].replace(/\s/g, '').toLowerCase()
        }
      })
      config[key] = formattedHeaders
    }
    return config;
  },

   /**
   * Simple function to convert a config value into a Google Spreadsheet row key,
   * and verify that it's valid for given row before getting deeper into the data.
   *
   * @param {string} config_column_name - a value as specified in a storymap config
   * @param {object} testRow - a row from reading the google spreadsheet which is expected to have this column
   */
  constructAndTestGSXColumn: function(config_column_name, testRow) {
    var col_name = "gsx$" + config_column_name.replace(/\s/g, '').toLowerCase();
      if (!testRow[col_name]) {
        throw {message:"Missing column [" + config_column_name + "]" }
      }
      return col_name;

  }
}

module.exports = {
  DataFactory
}
