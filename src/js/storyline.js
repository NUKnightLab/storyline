import { Chart } from './chart';
import { fetchData } from './data';
import { Slider } from './slider';

var Storyline = function(targetId, config) {
  //Chart
  var self = this;
  var slider = new Slider(config.slides);
  this.container = document.getElementById(targetId);

  (fetchData(config)).then(function(dataObj) {
    var highlightedRows = slider.highlightRows(),
        chart = new Chart(dataObj, highlightedRows);

    self.appendChart(chart);
    self.appendSlider(slider.createSlider());
  });
}
Storyline.prototype = { 
  buildSlides: function(config, targetId) {
    config 
  },
  appendChart: function(chart) {
    this.container.appendChild(chart.elem); 
  },
  appendSlider: function(sliderContent) {
    var slideWrapper = document.createElement('div'),
        WIDTH =document.getElementsByClassName('canvas')[0].clientWidth,
        MARGIN = 10;

    slideWrapper.setAttribute('class', 'slider-view');
    //slideWrapper.style.width = WIDTH + "px";
    slideWrapper.appendChild(sliderContent);

    this.container.appendChild(slideWrapper);
    //position//
    var numSlides = sliderContent.children.length;

    slideWrapper.style.width = WIDTH + "px";
    slideWrapper.childNodes[0].style.width = WIDTH * numSlides + "px";
    //set slide width//
    for(var i = 0; i < sliderContent.children.length; i++) {
      var realWidth = WIDTH - (MARGIN*2);
      sliderContent.children[i].style.width = realWidth + "px";
      sliderContent.children[i].style.border = MARGIN + "px solid white"; 
    }
    slideWrapper.style.opacity = 1;
  }
}

module.exports = {
  Storyline
}
