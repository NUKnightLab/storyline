var Slider = function(slides, startIndex) {
  this.activeSlide = startIndex;
  this.slides = slides;
  this.MARGIN = 10;
  this.bindElements();
}

Slider.prototype = {
  bindElements: function() {
    //create index key in slides for use in class naming by index in nav//
    for(var i in this.slides) {
      this.slides[i].index = i
    }
    this.cards = this.evalTemplate('slider-cards-template', this)
    this.nav = this.evalTemplate('nav-template', this)
    this.elem = this.createSlider();
  },
  /**
   * creates the slider view and appends slides to it
   *
   * @returns {HTMLElement} complete slider
   */
  createSlider: function() {
    var sliderView = document.createElement("div");
        sliderView.setAttribute('class', 'slider-view');

    sliderView.appendChild(this.cards);
    sliderView.appendChild(this.nav);
    this.attachClickHandler(this.nav.children[0].children);

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
  attachClickHandler: function(div) {
    var pastActiveSlide = this.activeSlide;
    for(var i=0; i < div.length; i++) {
      div[i].onclick = function(event, self) {
        var classes = event.target.classList;

        for(var i in classes) {
          if(classes[i].indexOf("-") != -1) {
            var currentActiveSlide = parseFloat(classes[i].split("-")[1]);
            var pastActiveSlide = storyline.slider.activeSlide
            storyline.slider.moveSlide(currentActiveSlide, pastActiveSlide)
            return false;
          }
        }
      }
    }
  },
  setActiveSlide: function(currentActiveSlide, pastActiveSlide) {
    this.activeSlide = currentActiveSlide;
    if(this.cards.children[pastActiveSlide].classList.contains('active')) {
      this.cards.children[pastActiveSlide].classList.remove('active');
      this.nav.children[0].children[pastActiveSlide].classList.remove('active');
      storyline.chart.markers[pastActiveSlide].classList.remove('active')
    }
    this.cards.children[currentActiveSlide].classList.add('active');
    this.nav.children[0].children[currentActiveSlide].classList.add('active');
    storyline.chart.markers[currentActiveSlide].classList.add('active')
  },
  moveSlide: function(index, pastIndex) {
    index = index!=undefined ? index : this.activeSlide;
    pastIndex = pastIndex | 0;

    var slide = this.cards.children[index];
    this.cards.style.marginLeft = -1 * (slide.offsetLeft - this.offset) + "px";

    this.setActiveSlide(index, pastIndex)
  },
  /**
   * sets the width of the document
   *
   * @param w
   * @returns {undefined}
   */
  setWidth: function(w) {
    if(w <= 480) {
      w = w - (this.MARGIN*2)
    } else {
      w = 500;
    }
    this.viewportSize = this.cards.parentElement.clientWidth;
    this.offset = this.viewportSize/2 - w/2 - this.MARGIN
    var numSlides = this.slides.length;
    this.cards.style.width = w * numSlides + "px";
    this.cards.style.marginLeft = this.offset + "px"
    for(var i = 0; i < this.cards.children.length; i++) {
      this.cards.children[i].style.width = w + "px";
      this.cards.children[i].style.border = this.MARGIN + "px solid white";
    }
    this.cards.style.opacity = 1;
  }
}

module.exports = {
  Slider: Slider
}
