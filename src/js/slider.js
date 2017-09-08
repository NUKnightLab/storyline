var Hammer = require('hammerjs');

/**
 * Instantiate a slider to display the given cards on the given storyline.
 *
 * @param {object} storyline - the storyline instance where this slider will be shown
 * @param {object[]} cards - an array of configuration objects containing the content for the cards in this slider
 * @param {object} config
 * @param {number} startIndex - an index for start card
 * @param {number} height - the intended height in pixels for the chart
 * @param {number} width - the intended width in pixels for the chart
 * @returns {undefined}
 */
var Slider = function(storyline, markers, cards, config, startIndex, height, width) {
  this.storyline = storyline;
  this.activeCard = startIndex;
  this.config = config;
  this.cards = cards;
  this.MARGIN = 10;
  this.NAV_HEIGHT = 16 + 10; // actual height + margin height//
  this.height = height;
  this.width = width;
  this.createSlider();
  this.attachMarkersToCards(markers);
  this.positionCards()
}

Slider.prototype = {
  createSlider: function() {
    //create index key in slides for use in class naming by index in nav//
    //mustache should have something about iterating over index//
    for(var i in this.cards) {
      this.cards[i].rowNumber = i
      this.populateSlideDates(this.cards[i])
    }
    this.cardsElem = this.renderTemplate('slider-cards-template', this)
    this.navElem = this.renderTemplate('nav-template', this)
    this.elem = this.createSliderView();
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
        sliderView.style.width = this.width + "px";

    sliderView.appendChild(this.cardsElem);
    sliderView.appendChild(this.navElem);

    sliderView.style.opacity = 1;

    return sliderView;
  },
  positionCards: function() {
    this.setCardWidth(this.width)
    this.goToCard();
    this.slideCard();
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
  attachMarkersToCards: function(markers) {
    this.attachClickHandler(markers)
  },
  attachClickHandler: function(div) {
    var pastActiveCard = this.activeCard;
    for(var i=0; i < div.length; i++) {
      div[i].onclick = function(event) {
        var classes = event.target.classList;
        if(classes.length > 0) {
          for(var i in classes) {
            if(classes[i].indexOf("-") != -1) {
              var currentActiveCard = parseFloat(classes[i].split("-")[1]);
              var pastActiveCard = this.activeCard
              this.goToCard(currentActiveCard)
              return false;
            }
          }
        }
      }.bind(this)
    }
  },
  setActiveCard: function(pastActiveCard, currentActiveCard) {
    if(pastActiveCard <= -1 || currentActiveCard >= this.cards.length) {
      return
    }
    PubSub.publish('card moved', {
      pastActiveCard: pastActiveCard,
      currentActiveCard: currentActiveCard,
      pastActiveCardElem: this.cardsElem.children[pastActiveCard],
      currentActiveCardElem: this.cardsElem.children[currentActiveCard]
    })
    this.activeCard = currentActiveCard;
    if(this.cardsElem.children[pastActiveCard].classList.contains('is-active')) {
      this.cardsElem.children[pastActiveCard].classList.remove('is-active');
      this.navElem.children[0].children[pastActiveCard].classList.remove('is-active');
    }
    this.cardsElem.children[currentActiveCard].classList.add('is-active');
    this.navElem.children[0].children[currentActiveCard].classList.add('is-active');
  },
  /**
   * sets the width of the document
   *
   * @param w
   * @returns {undefined}
   */
  setCardWidth: function(w) {
    if(w <= 600) {
      w = w * .75;
    } else {
      w = 500;
    }
    this.viewportSize = this.width;
    var offset = this.viewportSize/2 - w/2;
    this.cardWidth = w
    this.sliderWidth = w * this.cards.length;
    this.offsetPercent = offset/(w*this.cards.length) * 100
    this.offsets = this.getCardOffsets();
    this.cardsElem.style.width = this.sliderWidth + "px"
    this.cardsElem.style.transform = 'translateX(' + this.offsetPercent + '%)';
    for(var i = 0; i < this.cards.length; i++) {
      this.cardsElem.children[i].children[0].style.height = (this.height - this.NAV_HEIGHT - this.MARGIN*2) + "px";
      this.cardsElem.children[i].style.width = w + "px";
    }
  },
  populateSlideDates: function(card) {
    var d3Time = require('d3-time-format');

    if(!this.config.chart.datetime_format) {
      card.displayDate
    } else {
      var formatter = d3Time.timeFormat(this.config.chart.datetime_format);
      card.displayDate = formatter(card.displayDate)
    }
  },
  goToCard: function(number) {
    //catches condition when number is not passed in//
    number = number!=undefined ? number : this.activeCard;
    var self = this;
    if(number < 0) {
      this.activeCard = 0;
    } else if(number > this.cards.length - 1) {
      this.activeCard = number - 1
    } else {
      this.setActiveCard(this.activeCard, number)
      this.activeCard = number;
    }
    PubSub.publish('card moved', {
      pastActiveCard: this.activeCard,
      currentActiveCard: number,
      pastActiveCardElem: this.cardsElem.children[this.activeCard],
      currentActiveCardElem: this.cardsElem.children[number]
    })

    this.cardsElem.classList.add('is-animating')
    var percentage = -(100 / this.cards.length) * this.activeCard;
    percentage = percentage + this.offsetPercent
    this.cardsElem.style.transform = 'translateX(' + percentage + '%)';
    clearTimeout(timer);
    var timer = setTimeout(function() {
      self.cardsElem.classList.remove( 'is-animating' );
    }, 700 );
    this.currentOffset = this.offsets[self.activeCard];
  },
  getCardOffsets: function() {
    var self = this;
    var offsets = [];
    this.cards.map(function(card, index) {
      var offset = -(100/self.cards.length * index - self.offsetPercent)
      offsets.push(offset);
    })
    return offsets;
  },
  /**
   * Calculates position of slider offset based on dragging the card
   *
   * @returns {undefined}
   */
  slideCard: function() {
    var self = this;
    var offset;
    var transformPercentage = 0;
    var percentage = 0;
    this.currentOffset = this.offsetPercent;
    var handleHammer = function(ev) {
      ev.preventDefault();
      switch(ev.type) {
        case 'tap':
          self.storyline.trackEvent('tap', 'cards')
          var clickMoveCardSpace = (window.innerWidth - self.cardWidth - (2*self.MARGIN))/2
          var prevCardBound = clickMoveCardSpace/window.innerWidth;
          var nextCardBound = (window.innerWidth - clickMoveCardSpace)/window.innerWidth
          if(ev.center.x/window.innerWidth < prevCardBound) {
            var newCard = self.activeCard - 1;
            self.currentOffset = self.offsets[newCard];
            self.goToCard(self.activeCard - 1);
          } else if(ev.center.x/window.innerWidth > nextCardBound) {
            var newCard = self.activeCard + 1;
            self.currentOffset = self.offsets[newCard];
            self.goToCard(self.activeCard + 1);
          }
        break;
        case 'swipe':
          break;
        case 'panleft':
        case 'panright':
          var direction = null;
          if(ev.direction === 2) {
            direction = 1
          } else if(ev.direction === 4) {
            direction = -1
          }
          percentage = (ev.deltaX/self.sliderWidth) * 100
          transformPercentage = percentage + self.currentOffset
          if(inBounds(transformPercentage)) {
            self.cardsElem.style.transform = 'translateX(' + transformPercentage + '%)';
            var left = self.cardsElem.children[self.activeCard].getBoundingClientRect().left
            PubSub.publish('card move in progress', {
              left: left + (self.cardWidth/2),
              currentActiveCard: self.activeCard,
              pastActiveCard: (self.activeCard + direction) > -1 ? self.activeCard+direction : 0
            })
            var leftWithCard = left + self.cardWidth
            if(leftWithCard <= (self.width* 0.5) || left >= (self.width* 0.5)) {
              self.setActiveCard(self.activeCard, self.activeCard+direction)
              return;
            }
            return
          }
          break;
        case 'panend':
          self.currentOffset = self.offsets[self.activeCard]
          self.goToCard(self.activeCard)
          break;
      }
    }

    var inBounds = function(percentage) {
      var offsetBound = Math.abs(self.offsets[1] - self.offsets[0])/2
      var notTooFarRight = percentage < self.offsets[0] + offsetBound,
          notTooFarLeft = percentage > self.offsets[self.offsets.length - 1] - offsetBound;

      return notTooFarRight && notTooFarLeft;
    }

    var createHammer = function(v) {
      var mc = new Hammer.Manager(v, {})
      var pan = new Hammer.Pan({
        direction: Hammer.DIRECTION_HORIZONTAL,
        threshold: 25
      })
      var tap = new Hammer.Tap({
        domEvents: true
      })
      var swipe = new Hammer.Swipe({
        direction: Hammer.DIRECTION_HORIZONTAL,
        velocity: 0.5,
        threshold: 250
      })

      pan.recognizeWith(swipe)

      mc.add(pan)
      mc.add(tap)
      mc.add(swipe)
      mc.on('swipe panleft panright panend tap', handleHammer)
    }

    Array.prototype.map.call(this.cardsElem.children, function(content) {
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
       "{{#cards}}" +
       "<div class='slider-card {{class}}'>" +
         "<div class='slider-content'>" +
           "<h3><span class='h3-date'>{{ displayDate }}</span>" +
           "{{ slideTitle }}</h3>" +
           "<p>{{ slideText }}<p>" +
         "</div>" +
       "</div>" +
       "{{/cards}}" +
       "</div>",
    "nav-template":
      "<div class='nav'>" +
         "<ol>" +
           "{{#cards}}" +
             "<li class='nav nav-{{index}}'>" +
               "<a href='#'></a>" +
             "</li>" +
           "{{/cards}}" +
         "</ol>" +
       "</div>"
}
