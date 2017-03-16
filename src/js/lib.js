var lib = (function() {
  /**
   * onresize courtesy of this post: https://www.lullabot.com/articles/importing-css-breakpoints-into-javascript
   *
   * @returns {undefined}
  */
  function onResize() {
    var bp = {}
    bp.value = window.innerWidth
    PubSub.publish('window resized', bp)
  }

  return {
    onResize: onResize,
  }
})();

export {lib}
