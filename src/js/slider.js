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
    var a = Array.from(sliderView.children);

    //trying to preserve node lists//
    //nvm, ttly unnecessary
    for(var i=a.length; i>0; i--) {
      var className = a[0].className.split('-')[0];
      if(a.length == 1) {
        this.el[className] = a;
      } else {
        this.el[className] = a.splice(0, a.length-1);
      }
    }
    return sliderView;
  },
  attachClickHandler() {
    this.el.nav[0].addEventListener('click', function(event) {
      debugger;
      console.log('hello')
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
  highlightRows: function() {
    var rows = []
    this.slides.map(function(slide) {
      rows.push(slide.rowNum);
    })
    return rows;
  },
  moveSlide: function() {
    var slideWidth = this.el.slider[0].children[0].clientWidth;

    this.el.slider[0].style.marginLeft = - slideWidth + "px";
    return 'hello'
  }
}

module.exports = {
  Slider: Slider
}
