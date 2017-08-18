import { Storyline } from './storyline'
import { DataFactory } from './data'

var GUI = function() {
  this.preLoaded = false;
  this.storylineExists = false;
  this.storyline = {
    classObj: Storyline,
    elem: document.querySelector('#Storyline')
  }
  this.data = new DataFactory();
  this.config = {
    data: {
      url: undefined,
      data_column_name: undefined,
      datetime_format: undefined,
      datetime_column_name: undefined,
    },
    chart: {
      datetime_format: undefined,
      y_axis_label: undefined
    },
    cards: {
      title: undefined,
      text: undefined
    }
  }
}

/**
 * For user friendliness, we want our keys to be formatted according to today's date.
 */
var d3Time = require('d3-time-format');

const TODAY = new Date()
const FORMAT_STRINGS = [ '%Y', '%Y-%m-%d', '%m/%d/%y', '%m/%d/%Y', '%d/%m/%y', '%d/%m/%Y'];
var DATETIME_FORMATS = {}
for (var x of FORMAT_STRINGS) {
  DATETIME_FORMATS[d3Time.timeFormat(x)(TODAY)] = x;
}

const DATETIME_HEADERS = Object.keys(DATETIME_FORMATS);

/**
 * For each column offered, provide a handler that knows how to move its value into the
 * correct place in the storyline config object, translating values along the way when
 * necessary.
 */
const COLUMN_EXTRACTORS = {
  data_column_name: function(config, value) {
    config.data.data_column_name = value;
  },
  datetime_column_name: function(config, value) {
    config.data.datetime_column_name = value;
  },
  datetime_format: function(config, value) {
    if (value in DATETIME_FORMATS) {
      value = DATETIME_FORMATS[value]
    }
    config.data.datetime_format = value;
  },
  title: function(config, value) {
    config.cards.title = value;
  },
  text: function(config, value) {
    config.cards.text = value;
  }
}

GUI.prototype = {
  /**
   *
   *
   * @param {String} template name
   * @param {Object} columns
   * @returns {undefined}
   */
  createTemplate: function(template, columns) {
  var mustache = require('mustache');
  var columns  = columns ? columns : ''
  const MUSTACHE_TEMPLATES = {
        "urlBuilder":
          "<form>" +
          "<h2>Create a Storyline</h2>" +
          "<div class='input-group-label'>" +
          "<label class='input-group-addon' for='spreadsheet_url'>Google Spreadsheet URL</label>" +
           "<input type='text' id='spreadsheet_url' name='spreadsheet_url' placeholder='place link to spreadsheet here'>" +
           "<button id='load-btn' class='button-complement'>Load</button>" +
          "</div>" +
          "</form>",
        "columnBuilder":
          "<div class='flyout data-nav'>" +
          "<label for='{{column}}'>{{label}}</label>" +
            "<select class='column-selector' name='{{column}}' id={{column}}>" +
              "<option value=''> -- select -- </option>" +
              "{{#headers}}" +
               "<option value='{{ . }}'>{{ . }}</option>" +
               "{{/headers}}" +
             "</select>" +
          "</div>",
          "StorylineGenerator":
            "<button id='generate-storyline-btn' class='button-secondary' handler='generateStoryline'>Create Storyline</div>"
        }
  var rendered = mustache.render(MUSTACHE_TEMPLATES[template], columns),
      parser = new DOMParser(),
      doc = parser.parseFromString(rendered, "text/html")

    return doc.body.children[0];
  },

  buildColumnSelector: function(column, dataContext) {
      dataContext.label = dataContext.label || 'Select a column for the ' + dataContext.  column;
      var tmpl = this.createTemplate('columnBuilder', dataContext)
      tmpl.classList.add(column);
      this.appendTemplate('form', tmpl)
      this.bindEvents('.data-columns')
  },

  loadData: function(context) {
    if (event) event.preventDefault();
    var self = context;
    if(!self.preLoaded) {
      self.preLoaded = true
      var url = document.getElementById('spreadsheet_url').value.trim();
      if (url) { // for now just quietly ignore trigger if no URL
        document.getElementById('load-btn').className += ' disabled'
        self.config.data.url = url;
        self.data.fetchSheetHeaders(self.config, self.data).then(function(dataObj) {
          self.dataObj = dataObj
          self.dataObj.headers.map(function(header, index) {
            self.dataObj.headers[index] = header.replace(/gsx\$/g, '')
          })
          self.buildColumnSelector('x-column', {column:'datetime_column_name', headers: this.dataObj.headers, label: "Select date/time column"})
          self.buildColumnSelector('datetime-format-column', {column:'datetime_format', headers: DATETIME_HEADERS, label: "How are your dates formatted?"})
          self.buildColumnSelector('y-column', {column:'data_column_name', headers: this.dataObj.headers, label: "Select data column"})
          self.buildColumnSelector('cards-title-column', {column:'title', headers: this.dataObj.headers, label: "Select card title column"})
          self.buildColumnSelector('cards-text-column', {column:'text', headers: this.dataObj.headers, label: "Select card text column"})
          var tmpl = self.createTemplate('StorylineGenerator')
          self.appendTemplate('form', tmpl)
          self.bindEvents('#generate-storyline-btn')
        }.bind(self),
      function(reason) {
        console.log('fetchSheetHeaders reject, reason: ',reason)
        self.preLoaded = false;
      })
      }
    } else {
      console.log("preLoaded is true, not repeating");
    }
  },

  generateStoryline: function(context) {
    event.preventDefault();
    //clear timeout//
    var self = context;
    clearTimeout(self.t)
    event.target.className += ' disabled'
    if(!self.storylineExists) {
      var allColumns = document.querySelectorAll('select.column-selector')
      var selectedCols = 0

      for(var i=0; i<allColumns.length; i++) {
        var colname = allColumns[i].name;
        var value = allColumns[i].value;
        if(value.length === 0) {
          var errorMessage = 'Error, Please select an option for column ' + colname;
          throw new Error(errorMessage)
          break;
        } else {
          self.extractColumnValue(colname, value)
          selectedCols++;
        }
        if(selectedCols === 5) {
          window.storyline = new Storyline('Storyline', self.config)
          self.storylineExists = true;
          setTimeout(500, function() {window.location.hash = 'Storyline';});
        }
      }
    } else {
      var errorMessage = 'Error, only one storyline allowed'
      throw new Error(errorMessage)
    }
  },
  /**
   * For a given column, get its value, convert it if necessary, and store it for making the storyline.
   */
  extractColumnValue: function(colname, value) {
    if (colname in COLUMN_EXTRACTORS) {
      COLUMN_EXTRACTORS[colname](this.config, value);
      return true;
    }
    return false;
  },

  bindEvents: function(selector) {
    var self = this;
    var elem = document.querySelectorAll(selector)
    if (elem && elem.length && elem.length > 0) {
      elem.forEach(function(el) {
        var handler = el.getAttribute('handler');
        handler = Object.keys(self.__proto__).indexOf(handler) > -1 ? self.__proto__[handler] : ''
        el.onclick = function(){
          handler(self)
        }
    })} else {
      console.log("bindEvents: empty selection for " + selector);
    }
  },

  /**
   * appends template to the DOM
   *
   * @param {String} selector name of a dom node
   * @param {HTMLElement} rendered template
   * @returns {undefined}
   */
  appendTemplate: function(selector, template) {
    document.querySelector(selector).appendChild(template)
    return;
  },

  autofill: function() {
    document.querySelector('input').value = 'https://docs.google.com/spreadsheets/d/1amj29A-YdAXQu18PipfgJ6biylaUhYLBxNiP4PpzW5g/edit#gid=1399340410'
    document.querySelector('#load-btn').click()
    this.t = setTimeout(function() {
      var selects = document.querySelectorAll('select');

      var vals = ['date', d3Time.timeFormat('%m/%d/%y')(new Date()), 'usunemploymentrate', 'slidetitle', 'slidetext'];
      for(var i=0; i<selects.length;i++) {
        selects[i].value = vals[i]
      }
    },1000)
  }
}

module.exports = {
  GUI: GUI
}
