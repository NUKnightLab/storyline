var lib = (function() {
  var prevWidth = null;
  /**
   * onresize courtesy of this post: https://www.lullabot.com/articles/importing-css-breakpoints-into-javascript
   *
   * @returns {undefined}
  */
  function onResize() {
    var currentWidth = window.innerWidth
    if(prevWidth == undefined) {
      prevWidth = currentWidth;
    }
    if(prevWidth != window.innerWidth) {
      PubSub.publish('window resized', currentWidth)
    }
  }

  function errorLog(context) {
    var mustache = require('mustache');
    const template =
      "<div class='error'>" +
        "<h3><span class='error-message'>{{ errorMessage }}</span></h3>" +
      "</div>"
    var rendered = mustache.render(template, context),
        parser = new DOMParser(),
        doc = parser.parseFromString(rendered, "text/html");

    storyline.elem.append(doc.body.children[0])
  }

  function get(url) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.onload = function() {
        if(req.status == 200) {
          resolve(req.response)
        } else {
          reject(Error(req.statusText))
        }
      }
      req.onerror = function() {
        reject(Error("Network Error"));
      }
      req.send();
    })
  }

  return {
    onResize: onResize,
    errorLog: errorLog
    get: get
  }
})();

export {lib}
