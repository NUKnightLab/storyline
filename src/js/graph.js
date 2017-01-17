var readCSV = require('./example.js');

var graph = {
  Chart: function(w, h, data, bounds) {
    this.w = w;
    this.h = h;
    this.data = data;
    this.bounds = bounds;
  }
}

module.exports = {
  graph
}
