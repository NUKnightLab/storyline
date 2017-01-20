var Slider = function(slides) {
  this.slides = slides;
}

Slider.prototype = {
  createSlider: function() {
    var slides = document.createElement("div");
    var text = "";
    this.slides.map(function(slide) {
      text += slide.title;
    })
    slides.innerHTML = text;
    return slides;
  }, 
  highlightRows: function() {
    var rows = []
    this.slides.map(function(slide) {
      rows.push(slide.rowNum);
    })
    return rows;
  }
}

module.exports = {
  Slider
}
