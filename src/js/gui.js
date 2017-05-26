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
           "<a class='data-selected-column' href='#'>Columns</a>" +
           "<ul class='flyout-content data-nav stacked'>" +
            "{{#headers}}" +
             "<li>" +
              "<a class='data-columns' handler='loadColumn' href='#'>" +
               "{{ . }}" +
              "</a>" +
             "</li>" +
            "{{/headers}}" +
           "</ul>" +
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
    var self = context;
    self.config.data.url = event.target.previousElementSibling.value
    self.data.fetchSheetHeaders(self.config, self.data).then(function(dataObj) {
      self.dataObj = dataObj
      self.buildColumnSelector('x-column', {column:'x-column', headers: this.dataObj.headers})
      self.buildColumnSelector('y-column', {column:'y-column', headers: this.dataObj.headers})
      self.buildColumnSelector('datetime-format-column', {column:'datetime-format', headers: ['MM/DD/YY']})
      self.buildColumnSelector('cards-title-column', {column:'card-title', headers: this.dataObj.headers})
      self.buildColumnSelector('cards-text-column', {column:'card-text', headers: this.dataObj.headers})
    }.bind(self))
  },

  loadColumn: function(context) {
    var self = context;
    var parentElem = event.target.parentElement.parentElement.parentElement
    var selectedElem = parentElem.querySelector('.data-selected-column')
    selectedElem.innerText = event.target.text
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
