var mustache = require('mustache');

var Slider = function(slides) {
  this.mustache = mustache;
  this.slides = slides;
  this.activeSlide = this.getActiveSlide();
  this.setActiveSlide();
  this.el = {};
}

Slider.prototype = {
  createSlider: function() {
    var templates = ['slider-cards-template', 'nav-template'],
        sliderView = document.createElement("div"),
        mustache = this.mustache,
        slides = this.slides;

    sliderView.setAttribute('class', 'slider-view');

    templates.map(function(template) {
      var div = document.createElement("div"),
          templ = template.replace('-template', ''),
          templateContent = document.getElementById(template).innerHTML,
          rendered = mustache.render(templateContent, {slides: slides});

      div.setAttribute('class', templ);
      div.innerHTML = rendered;

      sliderView.appendChild(div);
    });

    for(var i=0; i<sliderView.children.length; i++) {
      var className = sliderView.children[i].className.split('-')[0];
      this.el[className] = sliderView.children[i];
    }
    return sliderView;
  },
  attachClickHandler() {
    this.el.nav[0].addEventListener('click', function(event) {
      console.log(event.target)
    })
  },
  /**
   * iterates through slides and sets pointer to activeslide
   *
   * @returns currentSlide
   */
  getActiveSlide: function() {
    for(var i=0; i<this.slides.length; i++) {
      if(this.slides[i].isActive) {
        this.currentSlide = i;
        return {"slide": this.slides[i], "number": i};
      }
    }
  },
  setActiveSlide: function() {
    this.activeSlide.slide['class'] = 'active';
  },
  //move to storyline, rename to identify marker rows//
  highlightRows: function() {
    var rows = []
    this.slides.map(function(slide) {
      rows.push(slide.rowNum);
    })
    return rows;
  },
  moveSlide: function(index) {
    //TODO: animate, set 'active' class, also change visual style of corresponding nav element //
    var slide = this.el.slider.children[index],
        margin = slide.offsetWidth - slide.clientWidth;

    this.el.slider.style.marginLeft = -1 * (slide.offsetLeft - margin) + "px"
    return this.el.slider.style.marginLeft;
  }
}

module.exports = {
  Slider: Slider
}
