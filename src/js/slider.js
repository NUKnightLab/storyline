var Slider = function(slides, startIndex) {
  this.activeCard = startIndex;
  this.slides = slides;
  this.MARGIN = 10;
  this.createSlider();
}

Slider.prototype = {
  createSlider: function() {
    //create index key in slides for use in class naming by index in nav//
    //mustache should have something about iterating over index//
    for(var i in this.slides) {
      this.slides[i].index = i
    }
    this.cards = this.renderTemplate('slider-cards-template', this)
    this.nav = this.renderTemplate('nav-template', this)
    this.elem = this.createSliderView();
    this.attachClickHandler(this.nav.children[0].children);
  },
  /**
   * creates the slider view and appends slides to it
   *
   * @returns {HTMLElement} complete slider
   */
  createSliderView: function() {
    var sliderView = document.createElement("div");
        sliderView.setAttribute('class', 'slider-view');

    sliderView.appendChild(this.cards);
    sliderView.appendChild(this.nav);

    return sliderView;
  },
  renderTemplate: function(templateId, context) {
    var mustache = require('mustache'),

    templateContent = document.getElementById(templateId).innerHTML,
    rendered = mustache.render(templateContent, context);

    var parser = new DOMParser(),
        doc = parser.parseFromString(rendered, "text/html");

    return doc.body.children[0];
  },
  attachClickHandler: function(div) {
    var pastActiveCard = this.activeCard;
    for(var i=0; i < div.length; i++) {
      div[i].onclick = function(event, self) {
        var classes = event.target.classList;

        for(var i in classes) {
          if(classes[i].indexOf("-") != -1) {
            var currentActiveCard = parseFloat(classes[i].split("-")[1]);
            var pastActiveCard = storyline.slider.activeCard
            storyline.slider.setTrayPosition(currentActiveCard, pastActiveCard)
            return false;
          }
        }
      }
    }
  },
  setActiveCard: function(currentActiveCard, pastActiveCard) {
    this.activeCard = currentActiveCard;
    if(this.cards.children[pastActiveCard].classList.contains('active')) {
      this.cards.children[pastActiveCard].classList.remove('active');
      this.nav.children[0].children[pastActiveCard].classList.remove('active');
      storyline.chart.markers[pastActiveCard].classList.remove('active')
    }
    this.cards.children[currentActiveCard].classList.add('active');
    this.nav.children[0].children[currentActiveCard].classList.add('active');
    storyline.chart.markers[currentActiveCard].classList.add('active')
  },
  setTrayPosition: function(index, pastIndex) {
    index = index!=undefined ? index : this.activeCard;
    pastIndex = pastIndex | 0;

    var card = this.cards.children[index];
    this.cards.style.marginLeft = -1 * (card.offsetLeft - this.offset) + "px";

    this.setActiveCard(index, pastIndex)
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
  }
}

module.exports = {
  Slider: Slider
}
