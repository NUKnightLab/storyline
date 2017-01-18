var readCSV = require('./example.js');

function Chart() {
  this.dimensions = function(w, h, data, bounds) {
    this.w = w;
    this.h = h;
    this.data = data;
    this.bounds = bounds;
  }
}

module.exports = {
  Chart
}

