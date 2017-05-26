import { Storyline } from './storyline'
import { lib } from './lib'
import { DataFactory } from './data'

var GUI = function() {
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
           "<input placeholder>" +
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
            "<button class='generate-storyline-btn' handler='generateStoryline'>Create Storyline</div>"
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
    event.preventDefault()
    var self = context;
    self.config.data.url = event.target.previousElementSibling.value
    self.data.fetchSheetHeaders(self.config, self.data).then(function(dataObj) {
      self.dataObj = dataObj
      self.buildColumnSelector('x-column', {column:'datetime_column_name', headers: this.dataObj.headers})
      self.buildColumnSelector('y-column', {column:'data_column_name', headers: this.dataObj.headers})
      self.buildColumnSelector('datetime-format-column', {column:'datetime_format', headers: ['MM/DD/YY']})
      self.buildColumnSelector('cards-title-column', {column:'title', headers: this.dataObj.headers})
      self.buildColumnSelector('cards-text-column', {column:'text', headers: this.dataObj.headers})
    }.bind(self))
    var tmpl = self.createTemplate('StorylineGenerator')
    self.appendTemplate('form', tmpl)
    self.bindEvents('.generate-storyline-btn')
  },

  loadColumn: function(context) {
    var self = context;
    var parentElem = event.target.parentElement.parentElement.parentElement
    var selectedElem = parentElem.querySelector('.data-selected-column')
    selectedElem.innerText = event.target.text
  },

  generateStoryline: function(context) {
    event.preventDefault();
    var self = context;
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
            self.config.data[classes[j]] = allColumns[i].text
            selectedCols++
          }
        }
      }
      if(selectedCols === 5) {
        window.storyline = new Storyline('Storyline', self.config)
      }
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
