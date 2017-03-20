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

  return {
    onResize: onResize,
  }
})();

export {lib}
