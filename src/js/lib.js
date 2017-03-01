var lib = (function() {
  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  /**
   * onresize courtesy of this post: https://www.lullabot.com/articles/importing-css-breakpoints-into-javascript
   *
   * @returns {undefined}
  */
  function onResize() {
    var bp = {}
    bp.value = window.getComputedStyle(document.querySelector('body'), ':before').getPropertyValue('content').replace(/\"/g, '');
    PubSub.publish('window resized', bp)
  }

  return {
    debounce: debounce,
    onResize: onResize
  }
})();

export {lib}
