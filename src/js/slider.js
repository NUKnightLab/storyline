var Slider = function(slides, startIndex) {
  var Promise = require('es6-promise').Promise;
  this.slides = slides;
  this.activeSlide = startIndex;
  this.createSlider();
}

Slider.prototype = {
  createSlider: function() {
    //create index key in slides for use in class naming by index in nav//
    for(var i in this.slides) {
      this.slides[i].index = i
    }

    this.evalTemplate('cards-template', this)
    this.evalTemplate('nav-template', this).then(function(response){
    var self = storyline.slider,
        sliderView = document.createElement("div");
    sliderView.setAttribute('class', 'slider-view');

    sliderView.appendChild(self.cards);
    sliderView.appendChild(self.nav);
    self.attachClickHandler(self.nav.children[0].children);
    self.elem = sliderView;
    })
  },
  evalTemplate: function(templateId, context) {
      debugger;
    var mustache = require('mustache'),
        parser = new DOMParser();
    
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest;
      
      req.open("GET", "/templates/template.html");
      req.onload = function() {
        if(req.status == 200) {
         var tempDom = parser.parseFromString(req.response, "text/html"),
             templateContent = tempDom.getElementById(templateId).innerHTML,
             rendered = mustache.render(templateContent, context),
             doc = parser.parseFromString(rendered, "text/html");
        
          resolve(req.response);
          //grab class//
          var className = templateId.split("-")[0];
          storyline.slider[className] = doc.body.children[0];
        } else {
          reject(Error(req.statusText));
        }
      }
      req.send();
    })
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

    this.cards.style.marginLeft = -1 * (slide.offsetLeft - margin) + "px"
    this.setActiveSlide(index, pastIndex)
    return this.cards.style.marginLeft;
  },
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
