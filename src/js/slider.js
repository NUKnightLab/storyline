var Slider = function(slides, startIndex) {
  this.slides = slides;
  this.elem = this.createSlider();
  this.activeSlide = startIndex;
  this.moveSlide(startIndex);
}

Slider.prototype = {
  createSlider: function() {
    var sliderView = document.createElement("div");
        sliderView.setAttribute('class', 'slider-view');

    //create index key in slides for use in class naming by index in nav//
    for(var i in this.slides) {
      this.slides[i].index = i
    }
    this.cards = this.evalTemplate('slider-cards-template', this)
    this.nav = this.evalTemplate('nav-template', this)
    sliderView.appendChild(this.cards);
    sliderView.appendChild(this.nav);
    this.attachClickHandler();

    return sliderView;
  },
  evalTemplate: function(templateId, context) {
    var mustache = require('mustache'),

    templateContent = document.getElementById(templateId).innerHTML,
    rendered = mustache.render(templateContent, context);

    var parser = new DOMParser(),
        doc = parser.parseFromString(rendered, "text/html");

    return doc.body.children[0];
  },
  attachClickHandler() {
    for(var i=0; i < this.nav.children[0].children.length; i++) {
      this.nav.children[0].children[i].onclick = function(event, self) {
        var classes = event.target.classList;
        
        for(var i in classes) {
          if(classes[i].indexOf("nav-") != -1) {
            var activeSlide = classes[i].split("-")[1];
            storyline.slider.activeSlide = activeSlide;
            storyline.slider.moveSlide(activeSlide)
            return false;
          }
        }
        event.target.className
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
    var slide = this.cards.children[index],
        margin = slide.offsetWidth - slide.clientWidth;

    this.cards.style.marginLeft = -1 * (slide.offsetLeft - margin) + "px"
    //change active slide as it moves//
    this.activeSlide = index;
    return this.cards.style.marginLeft;
  },
  setWidth: function(w) {
    var MARGIN = 10,
        numSlides = this.slides.length;

    this.cards.style.width = w * numSlides + "px";
    this.cards.style.marginLeft = 10 + "px"
    //set slide w//
    for(var i = 0; i < this.cards.children.length; i++) {
      var realWidth = w - (MARGIN*2);
      this.cards.children[i].style.width = realWidth + "px";
      this.cards.children[i].style.border = MARGIN + "px solid white";
    }
    this.cards.style.opacity = 1;
  }
}

module.exports = {
  Slider: Slider
}
