var GUI = function() {
}

GUI.prototype = {
  createGUI: function(columns) {
  var mustache = require('mustache');

  const MUSTACHE_TEMPLATES =
        "<div class='flyout data-nav'>" +
         "<a href='#'>Columns</a>" +
         "<ul class='flyout-content data-nav stacked'>" +
          "{{#columns}}" +
           "<li>" +
            "<a href='#'>" +
             "{{ . }}" +
            "</a>" +
           "</li>" +
          "{{/columns}}" +
         "</ul>" +
        "</div>"
  var rendered = mustache.render(MUSTACHE_TEMPLATES, {columns: columns}),
      parser = new DOMParser(),
      doc = parser.parseFromString(rendered, "text/html")

    return doc.body.children[0];
  }
}

module.exports = {
  GUI: GUI
}
