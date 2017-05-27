import { Storyline } from './storyline'
import { lib } from './lib'
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
 * Keys are offered in UI as choices; values are equivalent versions which will actually parse.
 */
const DATETIME_FORMATS = {
  'MM/DD/YY': '%m/%d/%y',
  'MM/DD/YYYY': '%m/%d/%Y',
  'DD/MM/YY': '%d/%m/%y',
  'DD/MM/YYYY': '%d/%m/%Y',
  'YYYY': '%Y'
}

var DATETIME_HEADERS = [];
for (var k in DATETIME_FORMATS) { DATETIME_HEADERS.push(k) }

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
          "<div class='data-nav'>" +
           "<input type='text' placeholder='place link to spreadsheet here'>" +
           "<button class='load-btn' handler='loadData'>Load Data</button>" +
          "</div>" +
          "</form>",
        "columnBuilder":
          "<div class='flyout data-nav'>" +
          "<p>Select a column for the {{column}}</p>" +
           "<a class='data-selected-column {{column}}' href='#'></a>" +
           "<ul class='flyout-content data-nav stacked'>" +
            "{{#headers}}" +
             "<li>" +
              "<a class='data-columns' handler='loadColumn' href='#'>" +
               "{{ . }}" +
              "</a>" +
             "</li>" +
            "{{/headers}}" +
           "</ul>" +
          "</div>",
          "StorylineGenerator":
            "<div>" +
              "<button class='generate-storyline-btn' handler='generateStoryline'>Create Storyline</div>" +
            "</div>"
        }
  var rendered = mustache.render(MUSTACHE_TEMPLATES[template], columns),
      parser = new DOMParser(),
      doc = parser.parseFromString(rendered, "text/html")

    return doc.body.children[0];
  },

  buildColumnSelector: function(column, dataContext) {
      var tmpl = this.createTemplate('columnBuilder', dataContext)
      tmpl.classList.add(column);
      this.appendTemplate('form', tmpl)
      this.bindEvents('.data-columns')
  },

  loadData: function(context) {
    event.preventDefault();
    var self = context;
    if(!self.preLoaded) {
    event.target.className += ' disabled'
    self.config.data.url = event.target.previousElementSibling.value
    self.data.fetchSheetHeaders(self.config, self.data).then(function(dataObj) {
      self.dataObj = dataObj
      self.buildColumnSelector('x-column', {column:'datetime_column_name', headers: this.dataObj.headers})
      self.buildColumnSelector('y-column', {column:'data_column_name', headers: this.dataObj.headers})
      self.buildColumnSelector('datetime-format-column', {column:'datetime_format', headers: DATETIME_HEADERS})
      self.buildColumnSelector('cards-title-column', {column:'title', headers: this.dataObj.headers})
      self.buildColumnSelector('cards-text-column', {column:'text', headers: this.dataObj.headers})
    }.bind(self))
    var tmpl = self.createTemplate('StorylineGenerator')
    self.appendTemplate('form', tmpl)
    self.bindEvents('.generate-storyline-btn')

    self.preLoaded = true
    } else {
      var errorMessage = 'Error, data has already been loaded'
      lib.errorLog({errorMessage})
    }
  },

  loadColumn: function(context) {
    var self = context;
    var parentElem = event.target.parentElement.parentElement.parentElement
    var selectedElem = parentElem.querySelector('.data-selected-column')
    selectedElem.className += ' selected'
    selectedElem.innerText = event.target.text
  },

  generateStoryline: function(context) {
    event.preventDefault();
    var self = context;
    event.target.className += ' disabled'

    if(!self.storylineExists) {
    var data = Object.keys(self.config.data).concat(Object.keys(self.config.cards))
    var allColumns = document.querySelectorAll('.data-selected-column')
    var selectedCols = 0
    for(var i=0; i<allColumns.length; i++) {
      if(allColumns[i].text.length === 0) {
        var errorMessage = 'Error, Please select an option for column'
        lib.errorLog({errorMessage})
          break;
      } else {
        //grab column data//
        var classes = allColumns[i].classList
        for(var j=0; j<classes.length; j++) {
          if(data.indexOf(classes[j]) > -1){
            var text = allColumns[i].text
            if(classes[j] === 'datetime_format') {
              if (text in DATETIME_FORMATS) {
                text = DATETIME_FORMATS[text]
              }
            }
            self.config.data[classes[j]] = text
            selectedCols++
          }
        }
      }
      if(selectedCols === 5) {
        window.storyline = new Storyline('Storyline', self.config)
      }
    }
    self.storylineExists = true;
    } else {
      var errorMessage = 'Error, only one storyline allowed'
      lib.errorLog({errorMessage})
    }
  },

  bindEvents: function(elem) {
    var self = this;
    var elem = document.querySelectorAll(elem)
    var handler = elem[0].getAttribute('handler');
    handler = Object.keys(self.__proto__).indexOf(handler) > -1 ? self.__proto__[handler] : ''
    elem.forEach(function(el) {
      el.onclick = function(){
        handler(self)
      }
    })
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
  }
}

module.exports = {
  GUI: GUI
}