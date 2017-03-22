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
    this.offset = this.viewportSize/2 - w/2 - this.MARGIN;
    this.cardwidth = w;
    var numSlides = this.slides.length;
    this.cards.style.width = w * numSlides + "px";
    this.cards.style.marginLeft = this.offset + "px"
    for(var i = 0; i < this.cards.children.length; i++) {
      this.cards.children[i].style.width = w + "px";
      this.cards.children[i].style.border = this.MARGIN + "px solid white";
    }
  },
  slideCard: function() {
    var self = this;
    var offset;
    var getOffset = function() {
      offset = self.cards.style.marginLeft;
      offset = parseInt(offset.split("px")[0], 10)
      self.offsets = [
        self.offset,
        -(self.cardwidth - self.offset),
        -(self.cardwidth*2 - self.offset),
        -(self.cardwidth*3 - self.offset),
        -(self.cardwidth*4 - self.offset)
      ]
      console.log(self.offsets)
    }
    var onPan = function(ev) {
      var delta = offset + ev.deltaX;
      var left = self.cardwidth*4 - self.offset
      if (delta >= -left && delta <= self.offset) {
        if(delta <= self.offsets[4]) {
          self.setActiveCard(4, self.activeCard)
          self.cards.style.marginLeft = self.offsets[4] + "px"
        } else if(delta <= self.offsets[3]) {
          self.setActiveCard(3, self.activeCard)
          self.cards.style.marginLeft = self.offsets[3] + "px"
        } else if(delta <= self.offsets[2]){
          self.setActiveCard(2, self.activeCard)
          self.cards.style.marginLeft = self.offsets[2] + "px"
        } else if(delta <= self.offsets[1]) {
          self.setActiveCard(1, self.activeCard)
          self.cards.style.marginLeft = self.offsets[1] + "px"
        } else if(delta <= self.offsets[0]) {
          self.setActiveCard(0, self.activeCard)
          self.cards.style.marginLeft = self.offsets[0] + "px"
        }
      }
    }

    var createHammer = function(v) {
      var mc = new Hammer.Manager(v, {})
      mc.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_HORIZONTAL,
        threshold: 10
      }))
      mc.on('panstart', getOffset)
      mc.on('panleft', onPan)
      mc.on('panright', onPan)
      mc.on('panend')
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
           "<h3><span class='h3-date'>{{ display_date }}</span>" +
           "{{ title }}</h3>" +
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
