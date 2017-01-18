function Chart() {
  this.dimensions = function(w, h, data, bounds) {
    this.w = w;
    this.h = h;
    this.data = data;
    this.bounds = bounds;
  }
  this.draw = function() {
   console.log(this.data);
   return this.data;
  }
}

module.exports = {
  Chart
}

