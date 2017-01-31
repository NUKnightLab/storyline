import { Chart } from './chart';
import { fetchData } from './data';
import { Slider } from './slider';

var Storyline = function(targetId, config) {
  //Chart
  var self = this;
  this.slider = new Slider(config.slides);
  var slider = this.slider;
  this.container = document.getElementById(targetId);

  (fetchData(config)).then(function(dataObj) {
    var highlightedRows = slider.highlightRows(),
        chart = new Chart(dataObj, highlightedRows);

    self.appendChart(chart);
    self.appendSlider(slider.createSlider());
    slider.attachClickHandler();
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
    var WIDTH = document.getElementsByClassName('canvas')[0].clientWidth,
        MARGIN = 10,
        numSlides;

    this.container.appendChild(sliderContent);
    numSlides = sliderContent.children[0].children.length;

    sliderContent.style.width = WIDTH + "px";
    sliderContent.childNodes[0].style.marginLeft = 10 + "px"
    sliderContent.childNodes[0].style.width = WIDTH * numSlides + "px";
    //set slide width//
    for(var i = 0; i < sliderContent.children[0].children.length; i++) {
      var realWidth = WIDTH - (MARGIN*2);
      sliderContent.children[0].children[i].style.width = realWidth + "px";
      sliderContent.children[0].children[i].style.border = MARGIN + "px solid white";
    }
    sliderContent.style.opacity = 1;
  }
}

module.exports = {
  Storyline
}
