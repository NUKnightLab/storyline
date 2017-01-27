var mustache = require('mustache');

var Slider = function(slides) {
    //passing module to slider context//
  this.mustache = mustache;
  this.slides = slides;
}

Slider.prototype = {
  createSlider: function() {
    var div = document.createElement("div"),
        templateContent = document.getElementById('slider-template').innerHTML,
        rendered = this.mustache.render(templateContent, {slides: this.slides});

    div.setAttribute('class', 'slider-cards');
    div.innerHTML = rendered;
    return div;
  }, 
  highlightRows: function() {
    var rows = []
    this.slides.map(function(slide) {
      rows.push(slide.rowNum);
    })
    return rows;
  },
  getSlide: function() {
    var slideWidth = document.getElementsByClassName('slider-card')[0].style.width

    document.getElementsByClassName('slider-cards')[0].style.marginLeft = "-" + slideWidth
    return 'hello'
  }
}

module.exports = {
  Slider: Slider
}
