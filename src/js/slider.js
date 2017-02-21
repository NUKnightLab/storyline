var Slider = function(slides, startIndex) {
  this.slides = slides;
  this.activeSlide = startIndex;
  this.elem = this.createSlider();
}

Slider.prototype = {
  /**
   * creates the slider view and appends slides to it
   *
   * @returns {HTMLElement} complete slider
   */
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
  //move to storyline, rename to identify marker rows//
  highlightRows: function() {
    var rows = []
    this.slides.map(function(slide) {
      rows.push(slide.rowNum);
    })
    return rows;
  },
  moveSlide: function(index, pastIndex) {
      index = index!=undefined ? index : this.activeSlide;
      pastIndex = pastIndex | 0;
    //TODO: animate //
    var slide = this.cards.children[index],
        margin = slide.offsetWidth - slide.clientWidth;

    this.cards.style.marginLeft = -1 * (slide.offsetLeft - margin - 20) + "px"
    this.setActiveSlide(index, pastIndex)
    setTimeout(this.cards.style.marginLeft, 20);
  },
  /**
   * sets the width of the document
   *
   * @param w
   * @returns {undefined}
   */
  setWidth: function(w) {
    var MARGIN = 10,
        numSlides = this.slides.length;

    this.cards.style.width = w * numSlides + "px";
    this.cards.style.marginLeft = 10 + "px"
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
