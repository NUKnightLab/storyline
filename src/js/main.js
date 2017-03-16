var throttle = require('lodash.throttle');

import {Storyline} from './storyline';
import {lib} from './lib'
window.Storyline = Storyline;

var throttled = throttle(lib.onResize, 250, { 'trailing': false });

window.onresize = throttled
