import {Storyline} from './storyline';

window.Storyline = Storyline;

/**
 * onresize courtesy of this post: https://www.lullabot.com/articles/importing-css-breakpoints-into-javascript
 *
 * @returns {undefined}
 */
window.onresize = function() {
  var bp = {}
  bp.value = window.getComputedStyle(document.querySelector('body'), ':before').getPropertyValue('content').replace(/\"/g, '');
  PubSub.publish('window resized', bp)
}

