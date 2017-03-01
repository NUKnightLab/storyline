import {Storyline} from './storyline';
import {lib} from './lib'
window.Storyline = Storyline;

window.onload = function() { lib.onResize() }
window.onresize = function() { lib.debounce(lib.onResize, 250) }


