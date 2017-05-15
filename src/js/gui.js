var GUI = function() {
}

GUI.prototype = {
  createTemplate: function(template, columns) {
  var mustache = require('mustache');
  var columns  = columns ? columns : ''

  const MUSTACHE_TEMPLATES = {
        "urlBuilder":
          "<div class='flyout data-nav'>" +
           "<input placeholder>" +
           "<button>Add URL</button>" +
          "</div>",
        "columnBuilder":
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
        }
  var rendered = mustache.render(MUSTACHE_TEMPLATES[template], {columns: columns}),
      parser = new DOMParser(),
      doc = parser.parseFromString(rendered, "text/html")

    return doc.body.children[0];
  },
  appendTemplate: function(id, template) {
    document.getElementById(id).appendChild(template)
    return;
  }
}

module.exports = {
  GUI: GUI
}
