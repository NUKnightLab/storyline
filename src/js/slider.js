var Hammer = require('hammerjs');

var Slider = function(slides, startIndex, height) {
  this.activeCard = startIndex;
  this.slides = slides;
  this.MARGIN = 10;
  this.height = height;
  this.createSlider();
  this.slideCard();
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
        sliderView.style.height = this.height + "px";

    sliderView.appendChild(this.cards);
    sliderView.appendChild(this.nav);

    return sliderView;
  },
  getTemplate: function(templateId) {
    return MUSTACHE_TEMPLATES[templateId];
  },
  renderTemplate: function(templateId, context) {
    var mustache = require('mustache'),
        templateContent = this.getTemplate(templateId),
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
    //this.cards.style.marginLeft = -1 * (card.offsetLeft - this.offset) + "px";

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
    var numSlides = this.slides.length;
    this.viewportSize = this.cards.parentElement.clientWidth;
    this.offset = this.viewportSize/2 - w/2 - this.MARGIN;
    this.offsetPercent = this.offset/(w*numSlides) * 100
    this.cards.style.width = w/this.viewportSize * 100 * numSlides + "%"
    this.cards.style.transform = 'translateX(' + this.offsetPercent + '%)';
    for(var i = 0; i < numSlides; i++) {
      this.cards.children[i].style.width = w/this.viewportSize * 100 + "%";
      this.cards.children[i].style.border = this.MARGIN + "px solid white";
    }
  },
  slideCard: function() {
    var self = this;
    var offset;
    var percentage = 0;
    var goToSlide = function(number) {
      if(number < 0)
        self.activeCard = 0;
      else if(number > self.slides.length - 1)
        self.activeCard = number
      else
        self.activeCard = number;
        var percentage = -(100 / self.slides.length) * self.activeCard;
        self.cards.style.transform = 'translateX(' + percentage + '%)';
    }
    var handleHammer = function(ev) {
      ev.preventDefault();
      switch(ev.type) {
        case 'panstart':
          //get offset//
          offset = self.cards.style.marginLeft;
          offset = parseInt(offset.split("px")[0], 10)
          break;
        case 'panleft':
        case 'panright':
          percentage = 100 / self.slides.length * ev.deltaX / window.innerWidth; // NEW: our % calc
          var transformPercentage = percentage - 100 / self.slides.length * self.activeCard
          self.cards.style.transform = 'translateX(' + transformPercentage + '%)'; // NEW: our CSS transform
          //var delta = offset + ev.deltaX;
          //var left = self.cardwidth*4 - self.offset
          //if(delta >= -left && delta <= self.offset) {
            //set container offset//
            //$('.slider-cards')[0].style.marginLeft = (percent+"px");
         //}
          break;
        case 'panend':
          //if(percentage < 0)
          //  goToSlide(self.activeCard + 1);
          //else if(percentage > 0)
          //  goToSlide(self.activeCard - 1);
          //else
          //  goToSlide(self.activeCard);
          break;
      }
    }

    var createHammer = function(v) {
      var mc = new Hammer.Manager(v, {})
      mc.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_HORIZONTAL,
        threshold: 50
      }))
      mc.on('panstart panleft panright panend', handleHammer)
      //mc.on('panstart', getOffset)
      //mc.on('panleft', onPan)
      //mc.on('panright', onPan)
      //mc.on('panend')
    }

    Array.prototype.map.call(this.cards.children, function(content) {
       content = content.children[0]
       createHammer(content)
    })
  }
}

module.exports = {
  Slider: Slider
}

const MUSTACHE_TEMPLATES = {
    "slider-cards-template":
      "<div class='slider-cards'>" +
       "{{#slides}}" +
       "<div class='slider-card {{class}}'>" +
         "<div class='slider-content'>" +
           "<h3>{{ title }}</h3>" +
           "<p>{{ text }}<p>" +
         "</div>" +
       "</div>" +
       "{{/slides}}" +
       "</div>",
    "nav-template":
      "<div class='nav'>" +
         "<ol>" +
           "{{#slides}}" +
             "<li class='nav nav-{{index}}'>" +
               "<a href='#'></a>" +
             "</li>" +
           "{{/slides}}" +
         "</ol>" +
       "</div>"
}
